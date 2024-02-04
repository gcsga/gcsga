import { ItemGURPS } from "@item/base/document.ts"
import { DurationType, EffectModificationContext, EffectSource, EffectSystemSource } from "./data.ts"
import { AttributeBonus, Feature } from "@feature/index.ts"
import { feature } from "@util/enum/feature.ts"
import { RollModifier, gid } from "@module/data/misc.ts"
import { ItemGCS } from "@item/gcs/document.ts"
import { BaseUser } from "types/foundry/common/documents/module.js"
import { TokenGURPS } from "@module/canvas/token/object.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { TokenDocumentGURPS } from "@scene/token-document/document.ts"
import { ConditionSource } from "@item/condition/index.ts"
import { ActorGURPS } from "@actor"

export interface EffectGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGURPS<TParent> {
	_source: EffectSource | ConditionSource
	system: EffectSystemSource
}

export class EffectGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGURPS<TParent> {
	_statusId: string | null = null

	get features(): Feature[] {
		if (this.system.features) {
			return this.system.features.map(e => {
				const FeatureConstructor = CONFIG.GURPS.Feature.classes[e.type as feature.Type]
				if (FeatureConstructor) {
					// @ts-expect-error contradicting types
					const f = new FeatureConstructor(e)
					Object.assign(f, e)
					return f
				}
				return new AttributeBonus(gid.Strength) // default
			})
		}

		return []
	}

	get formattedName(): string {
		return this.name || ""
	}

	secondaryText = ItemGCS.prototype.secondaryText

	get enabled(): boolean {
		return true
	}

	get reference(): string {
		return this.system.reference
	}

	get modifiers(): RollModifier[] {
		return this.system.modifiers || []
	}

	get combat(): Combat | null {
		if (!this.system.duration?.combat) return null
		return game.combats?.get(this.system.duration!.combat) || null
	}

	get duration(): { remaining: number; type: DurationType; total: number } {
		if (!this.combat || !this.system.duration || this.system.duration.type === DurationType.None)
			return { remaining: Infinity, type: DurationType.None, total: Infinity }
		let total = 0
		let remaining = 0
		if (this.system.duration.type === DurationType.Turns) {
			total = this.system.duration.turns || 0
			remaining = total + (this.system.duration.startTurn || 0) - (this.combat.turn || 0)
		}
		if (this.system.duration.type === DurationType.Rounds) {
			total = this.system.duration.rounds || 0
			remaining = total + (this.system.duration.startRound || 0) - this.combat.round
		}
		return {
			type: this.system.duration.type,
			total,
			remaining,
		}
	}

	get isExpired(): boolean {
		if (this.duration.type === DurationType.None) return false
		return this.duration.remaining <= 0
	}

	get level(): number {
		return this.system.levels?.current || 0
	}

	get maxLevel(): number {
		return this.system.levels?.max || 0
	}

	get canLevel(): boolean {
		return this.system.can_level
	}

	async increaseLevel(): Promise<this | undefined> {
		return await this.updateLevel(this.level + 1)
	}

	async decreaseLevel(): Promise<this | undefined> {
		if (this.canLevel && this.level - 1 <= 0) return this.delete()
		return await this.updateLevel(this.level - 1)
	}

	async updateLevel(level: number): Promise<this | undefined> {
		if (!this.canLevel) return
		if (level > this.maxLevel) return
		if (level < 0) return
		return this.update({ "system.levels.current": level })
	}

	protected override async _preCreate(
		data: this["_source"],
		options: DocumentModificationContext<TParent>,
		user: User,
	): Promise<boolean | void> {
		if (!data.system) return super._preCreate(data, options, user)
		if (!data.system?.duration?.combat && game.combat) data.system.duration.combat = game.combat!.id
		const combat = game.combat
		if (data.system?.duration?.combat) {
			if (data.system.duration.combat !== DurationType.None) {
				data.system.duration.startRound = combat?.round ?? null
				data.system.duration.startTurn = combat?.turn ?? null
			}
		}
		super._preCreate(data, options, user)
	}

	protected override _onCreate(
		data: this["_source"],
		options: EffectModificationContext<TParent>,
		userId: string,
	): void {
		super._onCreate(data, options, userId)
		this._displayScrollingStatus(true)
		this._statusId = Object.values(CONFIG.specialStatusEffects).includes(this.system.id ?? "")
			? this.system.id
			: null
		if (this._statusId) this.#dispatchTokenStatusChange(this._statusId, true)
		game.gurps.effectPanel.refresh()
	}

	protected override _onDelete(options: DocumentModificationContext<TParent>, userId: string): void {
		super._onDelete(options, userId)
		// If (game.combat?.started) {
		if (this.canLevel) this.system.levels!.current = 0
		this._displayScrollingStatus(false)
		if (this._statusId) this.#dispatchTokenStatusChange(this._statusId, false)
		game.gurps.effectPanel.refresh()
	}

	protected override _preUpdate(
		changed: DeepPartial<this["_source"]>,
		options: EffectModificationContext<TParent>,
		user: BaseUser,
	): Promise<boolean | void> {
		options.previousLevel = this.level
		return super._preUpdate(changed, options, user)
	}

	protected override _onUpdate(
		data: DeepPartial<this["_source"]>,
		options: EffectModificationContext<TParent>,
		userId: string,
	): void {
		super._onUpdate(data, options, userId)
		const [priorValue, newValue] = [options.previousLevel, this.level]
		const valueChanged = !!priorValue && !!newValue && priorValue !== newValue
		if (valueChanged) {
			const change = newValue > priorValue
			this._displayScrollingStatus(change)
			// If (this._statusId) this.#dispatchTokenStatusChange(this._statusId, false);
		}
		game.gurps.effectPanel.refresh()
	}

	_displayScrollingStatus(enabled: boolean): void {
		const actor = this.parent
		if (!actor) return
		const tokens = actor.isToken ? [actor.token?.object] : actor.getActiveTokens(true)
		let label = `${enabled ? "+" : "-"} ${this.name}`
		if (this.canLevel && this.level) label += ` ${this.level}`
		for (const t of tokens) {
			if (!t || !t.visible || !t.renderable) continue
			canvas.interface.createScrollingText(t.center, label, {
				anchor: CONST.TEXT_ANCHOR_POINTS.CENTER,
				direction: enabled ? CONST.TEXT_ANCHOR_POINTS.TOP : CONST.TEXT_ANCHOR_POINTS.BOTTOM,
				distance: 2 * t.h,
				fontSize: 28,
				stroke: 0x000000,
				strokeThickness: 4,
				jitter: 0.25,
			})
		}
	}

	#dispatchTokenStatusChange(statusId: string, active: boolean) {
		const tokens = this.parent?.getActiveTokens()
		if (tokens) for (const token of tokens) token._onApplyStatusEffect(statusId, active)
	}

	static async updateCombat(combat: Combat, _data: unknown, _options: unknown, _userId: string): Promise<void> {
		const previous = combat.previous
		if (!previous.tokenId) return
		const token = canvas?.tokens?.get(previous.tokenId) as TokenGURPS<TokenDocumentGURPS>
		if (token?.actor) {
			for (const effect of token.actor.gEffects) {
				if (effect.isExpired) {
					await effect.delete()
					ui?.notifications?.info(
						LocalizeGURPS.format(LocalizeGURPS.translations.gurps.combat.effect_expired, {
							effect: effect.name!,
						}),
					)
				}
			}
		}
	}
}
