import { HOOKS_GURPS, RollModifier, RollModifierTags, SYSTEM_NAME } from "@module/data/index.ts"
import { TokenGURPS } from "@module/canvas/token/object.ts"
import { UserFlags, UserFlagsGURPS, UserSourceGURPS } from "./data.ts"
import { TokenDocumentGURPS } from "@scene/token-document/index.ts"
import { SceneGURPS } from "@scene"
import { ActorGURPS } from "@actor"
import * as R from "remeda"

class UserGURPS extends User<ActorGURPS<null>> {
	override prepareData(): void {
		super.prepareData()
		if (canvas?.ready && canvas.tokens?.controlled && canvas.tokens?.controlled.length > 0) {
			game.gurps.effectPanel.refresh()
		}
	}

	override prepareBaseData(): void {
		super.prepareBaseData()
		this.flags = fu.mergeObject(
			{
				[SYSTEM_NAME]: {
					[UserFlags.Init]: true,
					[UserFlags.LastStack]: [],
					[UserFlags.ModifierStack]: [],
					[UserFlags.ModifierSticky]: false,
					[UserFlags.LastActor]: null,
					[UserFlags.LastToken]: null,
				},
			},
			this.flags,
		)
	}

	override _onUpdate(data: DeepPartial<this["_source"]>, options: DocumentUpdateContext<null>, userId: string): void {
		super._onUpdate(data, options, userId)
		if (game.user?.id !== userId) return

		const keys = Object.keys(fu.flattenObject(data))
		if (keys.includes(`flags.${SYSTEM_NAME}.settings.showEffectPanel`)) {
			game.gurps.effectPanel.refresh()
		}
	}

	get modifierTotal(): number {
		let total = 0
		const modifierStack = (this.getFlag(SYSTEM_NAME, UserFlags.ModifierStack) as RollModifier[]) ?? []
		for (const m of modifierStack) {
			total += m.modifier
		}
		return total
	}

	get lastTotal(): number {
		let total = 0
		const modifierStack = (this.getFlag(SYSTEM_NAME, UserFlags.LastStack) as RollModifier[]) ?? []
		for (const m of modifierStack) {
			total += m.modifier
		}
		return total
	}

	getActiveTokens(): TokenDocumentGURPS[] {
		if (!canvas.ready || canvas.tokens.controlled.length === 0) {
			return R.compact([game.user.character?.getActiveTokens(true, true).shift()])
		}
		return canvas.tokens.controlled.filter(t => t.isOwner).map(t => t.document)
	}

	addModifier(mod: RollModifier): void {
		const modList = (this.getFlag(SYSTEM_NAME, UserFlags.ModifierStack) as RollModifier[]) ?? []
		if (mod.tags?.includes(RollModifierTags.Range)) {
			const oldMod = modList.find(e => e.tags?.includes(RollModifierTags.Range))
			if (oldMod) {
				oldMod.modifier = mod.modifier
				oldMod.id = mod.id
			} else modList.push(mod)
		} else {
			const oldMod = modList.find(e => e.id === mod.id)
			if (oldMod) oldMod.modifier += mod.modifier
			else modList.push(mod)
		}
		this.setFlag(SYSTEM_NAME, UserFlags.ModifierStack, modList)
		Hooks.call(HOOKS_GURPS.AddModifier)
	}
}

interface UserGURPS extends User<ActorGURPS<null>> {
	targets: Set<TokenGURPS<TokenDocumentGURPS<SceneGURPS>>>
	flags: UserFlagsGURPS
	readonly _source: UserSourceGURPS
}

export { UserGURPS }
