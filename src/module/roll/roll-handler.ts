import {
	AbstractSkillGURPS,
	AbstractWeaponGURPS,
	MeleeWeaponGURPS,
	RangedWeaponGURPS,
	TraitContainerGURPS,
	TraitGURPS,
} from "@item"
import { ActorType, ItemType, RollModifier, RollType, SETTINGS, SYSTEM_NAME, gid } from "@data"
import { UserFlags } from "@module/user/data.ts"
import { ChatMessageGURPS } from "@module/chat-message/document.ts"
import { UserGURPS } from "@module/user/document.ts"
import { AttributeGURPS, BodyGURPS } from "@system"
import { ErrorGURPS, LocalizeGURPS } from "@util"
import { ActorGURPS } from "@actor"
import { DamageChat, DamagePayload } from "@module/apps/damage-calculator/damage-chat-message.ts"
import { DamageRollGURPS } from "./damage-roll.ts"
import { HitLocationUtil } from "@module/apps/damage-calculator/hit-location-utils.ts"
import { RollGURPS } from "./index.ts"

enum RollSuccess {
	Success = "success",
	Failure = "failure",
	CriticalSuccess = "critical_success",
	CriticalFailure = "critical_failure",
}

const MODIFIER_CLASS_ZERO = "zero"
const MODIFIER_CLASS_NEGATIVE = "neg"
const MODIFIER_CLASS_POSITIVE = "pos"

interface RollMargin {
	success: RollSuccess
	value: number
	string: string
}

interface BaseRollTypeData<TType extends RollType> {
	type: TType
	actor: string | null
	user: string
	name: string
	hidden: boolean
}

interface ModifierRollTypeData extends BaseRollTypeData<RollType.Modifier> {
	modifier: number
}
interface AttributeRollTypeData extends BaseRollTypeData<RollType.Attribute> {
	attribute: AttributeGURPS
}
interface SkillRollTypeData
	extends BaseRollTypeData<RollType.Skill | RollType.SkillRelative | RollType.Spell | RollType.SpellRelative> {
	item: AbstractSkillGURPS | null
}
interface AttackRollTypeData extends BaseRollTypeData<RollType.Attack> {
	item: AbstractWeaponGURPS | null
}
interface DamageRollTypeData extends BaseRollTypeData<RollType.Damage> {
	item: AbstractWeaponGURPS | null
	times?: number
}
interface ParryRollTypeData extends BaseRollTypeData<RollType.Parry> {
	item: MeleeWeaponGURPS | null
}
interface BlockRollTypeData extends BaseRollTypeData<RollType.Block> {
	item: MeleeWeaponGURPS | null
}
interface ControlRollTypeData extends BaseRollTypeData<RollType.ControlRoll> {
	item: TraitGURPS | TraitContainerGURPS | null
}
interface LocationRollTypeData extends BaseRollTypeData<RollType.Location> {
	body: BodyGURPS
}
interface GenericRollTypeData extends BaseRollTypeData<RollType.Generic> {
	formula: string
}

type RollTypeData =
	| ModifierRollTypeData
	| AttributeRollTypeData
	| SkillRollTypeData
	| AttackRollTypeData
	| DamageRollTypeData
	| ParryRollTypeData
	| BlockRollTypeData
	| ControlRollTypeData
	| LocationRollTypeData
	| GenericRollTypeData

type ChatData = {
	type: RollType
	actor: string | null
	name: string
	displayName: string
	item: Record<string, unknown>
	modifiers: (RollModifier & { class: string })[]
	success: RollSuccess
	total: string
	margin: string
	rollMode: RollMode
	formula: string
	effectiveText: string
	tooltip: string
}

abstract class RollTypeHandler<TData extends RollTypeData = RollTypeData> {
	get chatMessageTemplate(): string {
		return `systems/${SYSTEM_NAME}/templates/message/roll-against.hbs`
	}

	get effectiveLevelLabel(): string {
		return LocalizeGURPS.translations.gurps.roll.effective_skill
	}

	get displayNameLocalizationKey(): string {
		return LocalizeGURPS.translations.gurps.roll.skill_level
	}

	async handleRollType(data: TData): Promise<void> {
		if (!this.isValid(data)) return

		const messageData = await this.getMessageData(data)
		await ChatMessageGURPS.create(messageData, {})

		this.resetMods(data.user)
	}

	isValid(_data: TData): boolean {
		return true
	}

	async getMessageData(data: TData): Promise<DeepPartial<foundry.documents.ChatMessageSource>> {
		// const roll = await Roll.create(this.getFormula(data)).evaluate({ async: true })
		const roll = await Roll.create(this.getFormula(data)).evaluate()
		const level = this.getLevel(data)
		const effectiveLevel = this.getEffectiveLevel(data)
		const name = this.getName(data)
		const margin = this.getMargin(data, effectiveLevel, roll.total)

		const chatData: ChatData = {
			type: data.type,
			actor: data.actor,
			name,
			displayName: LocalizeGURPS.format(this.displayNameLocalizationKey, { name, level }),
			item: this.getItemData(data),
			modifiers: this.getModifiers(data).map(e => this._applyModifierClasses(e)),
			success: margin.success,
			total: `${roll.total!}: ${LocalizeGURPS.translations.gurps.roll.success[margin.success]}`,
			margin: margin.string,
			rollMode: data.hidden ? CONST.DICE_ROLL_MODES.PRIVATE : game.settings.get("core", "rollMode"),
			formula: this.getFormula(data),
			effectiveText: `<div class='effective'>${LocalizeGURPS.format(this.effectiveLevelLabel, { level: effectiveLevel })}</div>`,
			tooltip: await roll.getTooltip(),
		}

		const message = await renderTemplate(this.chatMessageTemplate, chatData)
		const actor = game.actors.get(data.actor ?? "")

		return {
			author: data.user,
			speaker: { actor: actor?.id ?? "" },
			// type: CONST.CHAT_MESSAGE_TYPES.ROLL,
			content: message,
			rolls: [JSON.stringify(roll)],
			sound: CONFIG.sounds.dice,
		}
	}

	getName(_data: TData): string {
		return ""
	}

	getActor(data: TData): ActorGURPS | null {
		return game.actors.get(data.actor ?? "") ?? null
	}

	getLevel(_data: TData): number {
		return 0
	}

	getEffectiveLevel(data: TData): number {
		return this.getModifiers(data).reduce((total, mod) => {
			return total + mod.modifier
		}, this.getLevel(data))
	}

	getUser(data: TData): UserGURPS | null {
		return game.users.get(data.user) ?? null
	}

	getItemData(_data: TData): Record<string, unknown> {
		return {}
	}

	getModifiers(data: TData): RollModifier[] {
		if (data.user === null) return []
		return game.users.get(data.user)?.flags[SYSTEM_NAME][UserFlags.ModifierStack] ?? []
	}

	protected _applyModifierClasses(modifier: RollModifier): RollModifier & { class: string } {
		return {
			...modifier,
			class:
				modifier.modifier > 0
					? MODIFIER_CLASS_POSITIVE
					: modifier.modifier < 0
						? MODIFIER_CLASS_NEGATIVE
						: MODIFIER_CLASS_ZERO,
		}
	}

	getSuccess(level: number, rollTotal: number): RollSuccess {
		if (rollTotal === 18) return RollSuccess.CriticalFailure
		if (rollTotal <= 4) return RollSuccess.CriticalSuccess
		if (level >= 15 && rollTotal <= 5) return RollSuccess.CriticalSuccess
		if (level >= 16 && rollTotal <= 6) return RollSuccess.CriticalSuccess
		if (level <= 15 && rollTotal === 17) return RollSuccess.CriticalFailure
		if (rollTotal - level >= 10) return RollSuccess.CriticalFailure
		if (level >= rollTotal) return RollSuccess.Success
		return RollSuccess.Failure
	}

	getMargin(data: TData, level: number, rollTotal: number): RollMargin {
		const success = this.getSuccess(level, rollTotal)
		const margin = Math.abs(level - rollTotal)
		const from = this.getName(data)
		const marginMod: RollModifier = {
			modifier: margin,
			id: LocalizeGURPS.format(LocalizeGURPS.translations.gurps.roll.success_from, { from }),
		}
		let marginClass = MODIFIER_CLASS_ZERO
		let marginTemplate = "gurps.roll.just_made_it"
		if ([RollSuccess.Failure, RollSuccess.CriticalFailure].includes(success)) {
			marginTemplate = "gurps.roll.failure_margin"
			marginClass = MODIFIER_CLASS_NEGATIVE
			marginMod.id = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.roll.failure_from, { from })
			marginMod.modifier = -margin
		} else if (margin > 0) {
			marginTemplate = "gurps.roll.success_margin"
			marginClass = MODIFIER_CLASS_POSITIVE
		}

		return {
			success,
			value: margin,
			string: `<div class="margin mod mod-${marginClass}" data-mod='${JSON.stringify(marginMod)}'>${game.i18n.format(marginTemplate, { margin })}</div>`,
		}
	}

	getFormula(_data: TData): string {
		return game.settings.get(SYSTEM_NAME, SETTINGS.ROLL_FORMULA)
	}

	getExtras(_data: TData, _rollTotal: number): Record<string, unknown> {
		return {}
	}

	async resetMods(userId: string | null): Promise<void> {
		if (userId === null) return
		const user = game.users.get(userId)
		if (!user) return
		if (user.flags[SYSTEM_NAME][UserFlags.ModifierSticky]) return
		await user.setFlag(SYSTEM_NAME, UserFlags.ModifierStack, [])
		game.gurps.modifierBucket.render()
	}
}

class ModifierRollTypeHandler extends RollTypeHandler<ModifierRollTypeData> {
	override async handleRollType(data: ModifierRollTypeData): Promise<void> {
		const user = this.getUser(data)
		if (!user) return
		return user.addModifier({ id: data.name, modifier: data.modifier })
	}
}

class AttributeRollTypeHandler extends RollTypeHandler<AttributeRollTypeData> {
	override getLevel(data: AttributeRollTypeData): number {
		return data.attribute.effective ?? 0
	}

	override getName(data: AttributeRollTypeData): string {
		return data.attribute.definition?.combinedName ?? ""
	}
}

class SkillRollTypeHandler extends RollTypeHandler<SkillRollTypeData> {
	override isValid(data: SkillRollTypeData): boolean {
		return !!data.item && !isNaN(data.item.effectiveLevel)
	}

	override getName(data: SkillRollTypeData): string {
		return data.item?.formattedName ?? ""
	}

	override getLevel(data: SkillRollTypeData): number {
		return data.item?.effectiveLevel ?? 0
	}

	override getModifiers(data: SkillRollTypeData): RollModifier[] {
		const actor = this.getActor(data)
		if (!(data.item?.isOfType(ItemType.Skill) && actor?.isOfType(ActorType.Character)))
			return super.getModifiers(data)
		const encumbrance = actor.encumbrance.current
		const encumbranceModifier: RollModifier = {
			id: LocalizeGURPS.format(LocalizeGURPS.translations.gurps.roll.encumbrance, {
				name: encumbrance.name,
			}),
			modifier: encumbrance.penalty * data.item.encumbrancePenaltyMultiplier,
		}
		if (data.item.encumbrancePenaltyMultiplier === 0) return super.getModifiers(data)
		return [encumbranceModifier, ...super.getModifiers(data)]
	}

	override getItemData(data: SkillRollTypeData): Record<string, unknown> {
		switch (true) {
			case data.item?.isOfType(ItemType.Skill):
				return {
					name: data.item.name,
					specializatoin: data.item.specialization,
				}
			case data.item?.isOfType(ItemType.Technique):
				return {
					name: data.item.name,
					specialization: data.item.specialization,
					default: data.item.default === null ? undefined : data.item.default,
				}
			case data.item?.isOfType(ItemType.Spell, ItemType.RitualMagicSpell):
				return {
					name: data.item.name,
					type: data.item.type,
				}
			default:
				return super.getItemData(data)
		}
	}
}

class ControlRollTypeHandler extends RollTypeHandler<ControlRollTypeData> {
	override getName(data: ControlRollTypeData): string {
		return data.item?.formattedName ?? ""
	}

	override getLevel(data: ControlRollTypeData): number {
		return data.item?.skillLevel ?? 0
	}

	override get displayNameLocalizationKey() {
		return LocalizeGURPS.translations.gurps.roll.cr_level
	}
}

class AttackRollTypeHandler extends RollTypeHandler<AttackRollTypeData> {
	override isValid(data: AttackRollTypeData): boolean {
		return !isNaN(this.getLevel(data))
	}

	override getLevel(data: AttackRollTypeData): number {
		return data.item?.level ?? 0
	}

	override getName(data: AttackRollTypeData): string {
		if (data.item?.itemName) return `${data.item.itemName}${data.item.usage ? ` - ${data.item.usage}` : ""}`
		return `${data.item?.formattedName}${data.item?.usage ? ` - ${data.item.usage}` : ""}`
	}

	override get chatMessageTemplate(): string {
		return `systems/${SYSTEM_NAME}/templates/message/roll-against-weapon.hbs`
	}

	override getItemData(data: AttackRollTypeData): Record<string, unknown> {
		const itemData = {
			usage: data.item?.usage,
			itemName: data.item?.itemName,
			formattedName: data.item?.formattedName,
			uuid: data.item?.uuid,
			weaponId: data.item?.id,
			damage: data.item?.damage.current,
			type: data.item?.type,
		}
		return data.item?.isOfType(ItemType.RangedWeapon)
			? {
					...itemData,
					rate_of_fire: data.item.ROF,
					recoil: data.item.recoil,
				}
			: itemData
	}

	override getExtras(data: AttackRollTypeData, rollTotal: number): Record<string, unknown> {
		const extra = {}

		if (data.item?.isOfType(ItemType.RangedWeapon)) {
			const effectiveROF = this.getEffectiveROF(data.item)
			const numberOfShots = Math.min(
				Math.floor(
					this.getMargin(data, this.getEffectiveLevel(data), rollTotal).value /
						data.item.recoil.resolve(data.item).shot,
				) + 1,
				effectiveROF,
			)
			if (numberOfShots > 1)
				fu.mergeObject(extra, {
					ranged: {
						rate_of_fire: data.item.rate_of_fire.current,
						recoil: data.item.recoil.current,
						potential_hits: numberOfShots,
					},
				})
		}

		fu.mergeObject(extra, {
			damage: {
				uuid: data.item?.uuid,
				weaponId: data.item?.id,
				attacker: data.actor,
				damage: data.item?.damage,
			},
		})
		return extra
	}

	getEffectiveROF(item: RangedWeaponGURPS): number {
		const rof = item.ROF.resolve(item)
		return rof.mode1.shotsPerAttack + Math.max(rof.mode1.secondaryProjectiles, 1)
	}
}

class ParryRollTypeHandler extends RollTypeHandler<ParryRollTypeData> {
	override isValid(data: ParryRollTypeData): boolean {
		return !!data.item && !isNaN(parseInt(data.item.parry.current ?? "")) && data.item.parry.current !== ""
	}

	override getLevel(data: ParryRollTypeData): number {
		return Math.floor(data.item?.level ?? 0 / 2) + (data.item?.parry.modifier ?? 0)
	}

	override getName(data: ParryRollTypeData): string {
		return data.item?.itemName ?? data.item?.formattedName ?? ""
	}

	override get displayNameLocalizationKey(): string {
		return LocalizeGURPS.translations.gurps.roll.parry
	}
}

class BlockRollTypeHandler extends RollTypeHandler<BlockRollTypeData> {
	override isValid(data: BlockRollTypeData): boolean {
		return !!data.item && !isNaN(parseInt(data.item.block.current ?? "")) && data.item.block.current !== ""
	}

	override getLevel(data: BlockRollTypeData): number {
		return Math.floor(data.item?.level ?? 0 / 2) + (data.item?.block.modifier ?? 0)
	}

	override getName(data: BlockRollTypeData): string {
		return data.item?.itemName ?? data.item?.formattedName ?? ""
	}

	override get displayNameLocalizationKey(): string {
		return LocalizeGURPS.translations.gurps.roll.block
	}
}

class DamageRollTypeHandler extends RollTypeHandler<DamageRollTypeData> {
	override getName(data: DamageRollTypeData): string {
		if (!data.item) return ""
		if (data.item.itemName === "") return data.item.formattedName
		return `${data.item?.itemName}${data.item.usage ? ` - ${data.item.usage}` : ""}`
	}

	override getExtras(data: DamageRollTypeData) {
		return { times: data.times ?? 1 }
	}

	override async getMessageData(data: DamageRollTypeData): Promise<DeepPartial<foundry.documents.ChatMessageSource>> {
		const extras = this.getExtras(data)
		const modifierTotal = this.getEffectiveLevel(data)

		const chatData: Partial<DamagePayload> = {
			name: this.getName(data),
			uuid: data.item?.uuid,
			attacker: data.actor ?? "",
			weaponID: data.item?.id,
			modifiers: this.getModifiers(data).map(e => this._applyModifierClasses(e)),
			modifierTotal,
			damageRoll: [],
			ranged: data.item?.isOfType(ItemType.RangedWeapon),
		}

		if (data.item?.isOfType(ItemType.RangedWeapon)) {
			chatData.range = {
				max: data.item.range.max,
				half: data.item.range.halfDamage,
			}
		}

		let stringified: string | null = null

		for (let i = 0; i < extras.times; i++) {
			const damageRoll = new DamageRollGURPS(data.item?.damage.current ?? "")
			await damageRoll.evaluate()

			if (!stringified) {
				stringified = damageRoll.stringified
				chatData.damage = damageRoll.displayString
				chatData.dice = damageRoll.dice
				chatData.damageType = damageRoll.damageType
				chatData.armorDivisor = damageRoll.armorDivisorAsInt
				chatData.damageModifier = damageRoll.damageModifier
			}

			chatData.damageRoll?.push({
				total: damageRoll.total! + modifierTotal,
				tooltip: await damageRoll.getTooltip(),
				hitlocation: DamageRollTypeHandler.getHitLocationFromLastAttackRoll(this.getActor(data)),
			})
		}

		const message = await renderTemplate(`systems/${SYSTEM_NAME}/templates/message/damage-roll.hbs`, chatData)

		let messageData: DeepPartial<foundry.documents.ChatMessageSource> = {
			author: data.user,
			speaker: { actor: chatData.attacker },
			// type: CONST.CHAT_MESSAGE_TYPES.ROLL,
			content: message,
			rolls: stringified ? [stringified] : [],
			sound: CONFIG.sounds.dice,
		}

		let userTarget = ""
		if (game.user?.targets.size) {
			userTarget = game.user?.targets.values().next().value.id
		}

		messageData = DamageChat.setTransferFlag(messageData, chatData, userTarget)
		return messageData
	}

	/**
	 * Determine Hit Location. In the future, the Attack roll (above) should be able to determine if there is a modifier
	 * for hit location. If there is, use that. Otherwise go to the world settings to determine the default damage
	 * location. (Or, eventually, we could ask the target for it's default hit location...).
	 *
	 * @param actor
	 */
	private static getHitLocationFromLastAttackRoll(actor: ActorGURPS | null): string {
		const name = game.settings.get(SYSTEM_NAME, SETTINGS.DEFAULT_DAMAGE_LOCATION)
		const location = actor?.hitLocationTable.locations.find(l => l.id === name)
		return location?.table_name ?? "Torso"
	}
}

class LocationRollTypeHandler extends RollTypeHandler<LocationRollTypeData> {
	override async handleRollType(data: LocationRollTypeData): Promise<void> {
		const actor = this.getActor(data)
		if (actor === null) throw ErrorGURPS("No actor for hit location roll")
		if (!actor.isOfType(ActorType.Character))
			throw ErrorGURPS(`actor is of type ${actor.type}, which does not have a hit location table.`)
		const result = await HitLocationUtil.rollRandomLocation(actor.hitLocationTable)

		// Get localized version of the location id, if necessary.
		const location = result.location?.choice_name ?? gid.Torso

		const message = await renderTemplate(`systems/${SYSTEM_NAME}/templates/message/random-location-roll.hbs`, {
			actor: { name: actor?.name, actor: { id: actor?.id } },
			location: location,
			tooltip: await result.roll.getTooltip(),
		})

		const messageData = {
			author: data.user,
			// type: CONST.CHAT_MESSAGE_TYPES.ROLL,
			content: message,
			rolls: [JSON.stringify(result.roll)],
			sound: CONFIG.sounds.dice,
		}

		await ChatMessageGURPS.create(messageData, {})
		await this.resetMods(data.user)
	}
}

class GenericRollTypeHandler extends RollTypeHandler<GenericRollTypeData> {
	override async handleRollType(data: GenericRollTypeData): Promise<void> {
		const formula = this.getFormula(data)
		// const roll = await RollGURPS.create(formula).evaluate({ async: true })
		const roll = await RollGURPS.create(formula).evaluate()
		const modifiers = this.getModifiers(data).map(e => this._applyModifierClasses(e))
		const total = modifiers.reduce((acc, mod) => {
			return acc + mod.modifier
		}, roll.total)

		const chatData = {
			formula,
			name: roll.formula,
			total,
			modifiers,
			type: data.type,
			tooltip: await roll.getTooltip(),
		}

		const message = await renderTemplate(`systems/${SYSTEM_NAME}/templates/message/generic-roll.hbs`, chatData)

		const messageData: DeepPartial<ChatMessageGURPS["_source"]> = {
			author: data.user,
			// type: CONST.CHAT_MESSAGE_TYPES.ROLL,
			content: message,
			rolls: [JSON.stringify(roll)],
			sound: CONFIG.sounds.dice,
			speaker: { actor: data.actor },
		}

		await ChatMessageGURPS.create(messageData, {})
		await this.resetMods(data.user)
	}

	override getFormula(data: GenericRollTypeData): string {
		return data.formula ?? super.getFormula(data)
	}
}

const rollTypeHandlers: Record<RollType, RollTypeHandler> = {
	[RollType.Modifier]: new ModifierRollTypeHandler(),
	[RollType.Attribute]: new AttributeRollTypeHandler(),
	[RollType.Skill]: new SkillRollTypeHandler(),
	[RollType.SkillRelative]: new SkillRollTypeHandler(),
	[RollType.Spell]: new SkillRollTypeHandler(),
	[RollType.SpellRelative]: new SkillRollTypeHandler(),
	[RollType.ControlRoll]: new ControlRollTypeHandler(),
	[RollType.Attack]: new AttackRollTypeHandler(),
	[RollType.Parry]: new ParryRollTypeHandler(),
	[RollType.Block]: new BlockRollTypeHandler(),
	[RollType.Damage]: new DamageRollTypeHandler(),
	[RollType.Location]: new LocationRollTypeHandler(),
	[RollType.Generic]: new GenericRollTypeHandler(),
}

export { RollTypeHandler, rollTypeHandlers }
export type { RollTypeData }
