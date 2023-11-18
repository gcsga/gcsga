import { ItemType, RollModifier, RollType, SETTINGS, SYSTEM_NAME, UserFlags } from "@module/data"
import { RollGURPS } from "."
import { CharacterGURPS } from "@actor"
import { MeleeWeaponGURPS, RangedWeaponGURPS, SkillGURPS, TechniqueGURPS } from "@item"
import { LocalizeGURPS } from "@util"
import { DamageRollGURPS } from "./damage_roll"
import { DamageChat, DamagePayload } from "@module/damage_calculator/damage_chat_message"
import { ActorGURPS } from "@module/config"

enum RollSuccess {
	Success = "success",
	Failure = "failure",
	CriticalSuccess = "critical_success",
	CriticalFailure = "critical_failure",
}

const MODIFIER_CLASS_ZERO = "zero"
const MODIFIER_CLASS_NEGATIVE = "neg"
const MODIFIER_CLASS_POSITIVE = "pos"

type ChatData = {
	name: string
	actor: string | null
	displayName: string
	modifiers: Array<RollModifier & { class?: string }>
	success: RollSuccess
	margin: string
	margin_number: number
	type: RollType
	item: any
	total: string
	tooltip: string
	eff: string
	extra?: any
}

abstract class RollTypeHandler {
	async handleRollType(
		user: StoredDocument<User> | null,
		actor: CharacterGURPS,
		data: RollTypeData,
		formula: string,
		hidden: boolean
	): Promise<void> {
		if (!this.isValid(data)) return

		let messageData = await this.getMessageData(
			actor,
			user,
			this.getItem(data),
			this.getLevel(data),
			formula,
			this.getName(data),
			this.getType(data)
		)
		if (hidden) messageData.rollMode = CONST.DICE_ROLL_MODES.PRIVATE

		await ChatMessage.create(messageData, {})
		await this.resetMods(user)
	}

	isValid(_: RollTypeData): boolean {
		return true
	}

	getItem(data: RollTypeData): any {
		return data.item
	}

	getLevel(data: RollTypeData): number {
		return data.item.effective.level as number
	}

	getName(data: RollTypeData): string {
		return data.item.formattedName
	}

	getType(data: RollTypeData): RollType {
		return data.type
	}

	get chatMessageTemplate(): string {
		return `systems/${SYSTEM_NAME}/templates/message/roll-against.hbs`
	}

	/**
	 * This is where we actually create and format the chat message data. This is a "template method" -- it should be
	 * the same for all subclasses of RollTypeHandler. Differences in processing should be handled by overriding the
	 * other methods.
	 * @see https://en.wikipedia.org/wiki/Template_method_pattern
	 *
	 * @param actor
	 * @param user
	 * @param item
	 * @param level
	 * @param formula
	 * @param name
	 * @param type
	 * @returns The chat message data.
	 */
	async getMessageData(
		actor: CharacterGURPS,
		user: StoredDocument<User> | null,
		item: any,
		level: number,
		formula: string,
		name: string,
		type: RollType
	): Promise<Record<string, any>> {
		// Create an array of Modifiers suitable for display.
		const modifiers: Array<RollModifier & { class?: string }> = this.getModifiers(user)

		// Determine the encumbrance penalty, if any, and add it to the modifiers.
		const encumbrance = actor.encumbranceLevel(true)
		level = this.modifyForEncumbrance(item, encumbrance, modifiers, level)

		// Calculate the effective level by applying all modifiers.
		const effectiveLevel = this.applyMods(level, modifiers)

		// Roll the dice and determine the success/failure and margin.
		const roll = await Roll.create(formula).evaluate({ async: true })
		const [success, margin, marginText] = this.getMargin(name, effectiveLevel, roll.total!)

		this.addModsDisplayClass(modifiers)

		const chatData: ChatData = {
			name,
			actor: actor.id,
			displayName: LocalizeGURPS.format(this.displayNameLocalizationKey, { name, level }),
			modifiers,
			success,
			margin: marginText,
			margin_number: margin,
			type,
			item: this.getItemData(item, actor),
			total: `${roll.total!}: ${LocalizeGURPS.translations.gurps.roll.success[success]}`,
			tooltip: await roll.getTooltip(),
			eff: `<div class="effective">${LocalizeGURPS.format(this.effectiveLevelLabel, {
				level: effectiveLevel,
			})}</div>`,
			extra: null,
		}

		chatData.extra = this.getExtraData(chatData)

		const message = await renderTemplate(this.chatMessageTemplate, chatData)
		const messageData: any = {
			user: user,
			speaker: { actor: actor.id },
			type: CONST.CHAT_MESSAGE_TYPES.ROLL,
			content: message,
			roll: JSON.stringify(roll),
			sound: CONFIG.sounds.dice,
		}
		return messageData
	}

	/**
	 * @returns The Handlebars template to use for the chat message content.
	 */
	get effectiveLevelLabel(): string {
		return LocalizeGURPS.translations.gurps.roll.effective_skill
	}

	getExtraData(_: ChatData): any {
		return null
	}

	/**
	 * Modifies the level based on the provided encumbrance and modifiers.
	 * @param item - The item associated with the RollGURPS.
	 * @param encumbrance - The encumbrance value to use for the modification.
	 * @param modifiers - The modifiers to apply to the RollGURPS.
	 * @param level - The current level.
	 * @returns The modified level.
	 */
	modifyForEncumbrance(item: any, encumbrance: any, modifiers: any, level: number): number {
		return level
	}

	/**
	 * @returns The localization key for displaying the name and level of the roll.
	 */
	get displayNameLocalizationKey() {
		return LocalizeGURPS.translations.gurps.roll.skill_level
	}

	/**
	 * @param item
	 * @param actor
	 * @returns Additional data to be included in the chat message.
	 */
	getItemData(item: any, actor: CharacterGURPS): any {
		return {}
	}

	/**
	 * @param level - The level of the roll.
	 * @param modStack - The stack of modifiers to apply to the roll.
	 * @returns The effective level after applying all modifiers.
	 */
	applyMods(level: number, modStack: RollModifier[]): number {
		let effectiveLevel = level
		modStack.forEach(m => {
			effectiveLevel += m.modifier
		})
		return effectiveLevel
	}

	getMargin(name: string, level: number, roll: number): [RollSuccess, number, string] {
		const success = this.getSuccess(level, roll)
		const margin = Math.abs(level - roll)
		const marginMod: Partial<RollModifier> = { modifier: margin }
		marginMod.name = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.roll.success_from, { from: name })

		let marginClass = MODIFIER_CLASS_ZERO
		let marginTemplate = "gurps.roll.just_made_it"

		if ([RollSuccess.Failure, RollSuccess.CriticalFailure].includes(success)) {
			marginTemplate = "gurps.roll.failure_margin"
			marginClass = MODIFIER_CLASS_NEGATIVE
			marginMod.name = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.roll.failure_from, { from: name })
			marginMod.modifier = -margin
		} else if (margin > 0) {
			marginTemplate = "gurps.roll.success_margin"
			marginClass = MODIFIER_CLASS_POSITIVE
		}

		return [
			success,
			margin,
			`<div
			class="margin mod mod-${marginClass}"
			data-mod='${JSON.stringify(marginMod)}'
			>${game.i18n.format(marginTemplate, { margin: margin })}</div>`,
		]
	}

	// TODO: change from string to enum
	/**
	 * Check to see if the roll succeeded, and return the type of success/failure (normal/critical).
	 * @param {number} level
	 * @param {number} rollTotal
	 * @returns {RollSuccess}
	 */
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

	getModifiers(user: StoredDocument<User> | null): RollModifier[] {
		const stack = user?.getFlag(SYSTEM_NAME, UserFlags.ModifierStack) as RollModifier[]
		return stack ? [...stack] : []
	}

	async resetMods(user: StoredDocument<User> | null) {
		if (!user) return
		const sticky = user.getFlag(SYSTEM_NAME, UserFlags.ModifierSticky)
		if (sticky === false) {
			await user.setFlag(SYSTEM_NAME, UserFlags.ModifierStack, [])
			await user.setFlag(SYSTEM_NAME, UserFlags.ModifierTotal, 0)
			const button = game.ModifierButton
			return button.render()
		}
	}

	addModsDisplayClass(modifiers: Array<RollModifier & { class?: string }>): Array<RollModifier & { class?: string }> {
		modifiers.forEach(m => {
			m.class = MODIFIER_CLASS_ZERO
			if (m.modifier > 0) m.class = MODIFIER_CLASS_POSITIVE
			if (m.modifier < 0) m.class = MODIFIER_CLASS_NEGATIVE
		})
		return modifiers
	}
}

class ModifierRollTypeHandler extends RollTypeHandler {
	async handleRollType(
		user: StoredDocument<User> | null,
		actor: CharacterGURPS,
		data: RollTypeData,
		raFormula?: string,
		hidden?: boolean
	): Promise<void> {
		if (!user) return
		const mod: RollModifier = {
			name: data.comment,
			modifier: data.modifier,
			tags: [],
		}
		return game.ModifierButton.window.addModifier(mod)
	}
}

class AttributeRollTypeHandler extends RollTypeHandler {
	override getItem(data: any): any {
		return data.attribute
	}

	override getLevel(data: any): number {
		return data.attribute.effective as number
	}

	override getName(data: any): string {
		return data.attribute.attribute_def.combinedName
	}

	override get effectiveLevelLabel(): string {
		return LocalizeGURPS.translations.gurps.roll.effective_skill
	}

	override getItemData(item: any, actor: CharacterGURPS) {
		return { id: item.id }
	}
}

class SkillRollTypeHandler extends RollTypeHandler {
	override isValid(data: RollTypeData): boolean {
		return !isNaN(data.item.effectiveLevel)
	}

	override getLevel(data: any): number {
		return data.item.effectiveLevel as number
	}

	override getType(data: any): RollType {
		return RollType.Skill
	}

	override modifyForEncumbrance(item: any, encumbrance: any, modifiers: any, level: number): number {
		if (item instanceof SkillGURPS && item.encumbrancePenaltyMultiplier && encumbrance.level > 0) {
			modifiers.unshift({
				name: LocalizeGURPS.format(LocalizeGURPS.translations.gurps.roll.encumbrance, {
					name: encumbrance.name,
				}),
				modifier: encumbrance.penalty,
			})
			return level - encumbrance.penalty
		}
		return level
	}

	override getItemData(item: any, actor: CharacterGURPS): any {
		let itemData = {} as any
		if (item instanceof SkillGURPS || item instanceof TechniqueGURPS) {
			itemData = { name: item.name, specialization: item.specialization }
			if (item.dummyActor && item.defaultedFrom) {
				itemData.default = `${item.defaultedFrom.fullName(actor as any)}`
				const modifier =
					(item.defaultedFrom.modifier < 0 ? " - " : " + ") + Math.abs(item.defaultedFrom.modifier)
				itemData.default += modifier
			}
		}
		return itemData
	}
}

class ControlRollTypeHandler extends RollTypeHandler {
	override getLevel(data: RollTypeData): number {
		return data.item.skillLevel as number
	}

	override get displayNameLocalizationKey() {
		return LocalizeGURPS.translations.gurps.roll.cr_level
	}
}

class AttackRollTypeHandler extends RollTypeHandler {
	static SHOTGUN_ROF = /(\d+)[×xX*](\d+)/ // 3x10, for example

	override isValid(data: RollTypeData): boolean {
		return !isNaN(this.getLevel(data))
	}

	override getLevel(data: RollTypeData): any {
		// TODO If data.item.skillLevel is a function, call it with null as the argument;
		// otherwise, just return the value.
		if (typeof data.item.skillLevel === "function") return data.item.skillLevel(null)
		else return data.item.skillLevel
	}

	override getName(data: RollTypeData): string {
		if (data.item.itemName) return `${data.item.itemName}${data.item.usage ? ` - ${data.item.usage}` : ""}`
		return `${data.item.formattedName}${data.item.usage ? ` - ${data.item.usage}` : ""}`
	}

	get chatMessageTemplate(): string {
		return `systems/${SYSTEM_NAME}/templates/message/roll-against-ranged.hbs`
	}

	override getItemData(item: any, actor: CharacterGURPS): any {
		let itemData = {} as any
		if (item instanceof MeleeWeaponGURPS || item instanceof RangedWeaponGURPS) {
			itemData = {
				usage: item.system.usage,
				itemName: item.itemName,
				formattedName: item.formattedName,
				uuid: item.uuid,
				weaponID: item.id,
				damage: item.fastResolvedDamage,
			}
			if (item instanceof RangedWeaponGURPS) {
				mergeObject(itemData, {
					rate_of_fire: item.rate_of_fire,
					recoil: item.recoil
				})
			}
		}
		return itemData
	}

	override getExtraData(data: ChatData): any {
		let extra = {}

		// If Ranged, add number of potential hits if greater than one.
		if (data.item.type === ItemType.RangedWeapon) {
			const item = data.item
			if (this.validRateOfFire(item.rate_of_fire) && data.margin_number > 0 && parseInt(item.recoil) > 0) {
				const effectiveRof = this.effectiveRateOfFire(item.rate_of_fire)
				let numberOfShots = Math.min(Math.floor(data.margin_number / parseInt(item.recoil)) + 1, effectiveRof)
				if (numberOfShots > 1)
					mergeObject(extra, {
						ranged: {
							rate_of_fire: item.rate_of_fire,
							recoil: item.recoil,
							potential_hits: numberOfShots,
						},
					})
			}
		}

		// For any attack, add the damage data for easy access.
		mergeObject(extra, {
			damage: {
				uuid: data.item.uuid,
				weaponID: data.item.weaponID,
				attacker: data.actor,
				damage: data.item.damage,
			},
		})

		return Object.keys(extra).length ? extra : null
	}

	private effectiveRateOfFire(rate_of_fire: string) {
		if (rate_of_fire.match(AttackRollTypeHandler.SHOTGUN_ROF)) {
			const match = rate_of_fire.match(AttackRollTypeHandler.SHOTGUN_ROF)
			return parseInt(match![1]) * parseInt(match![2])
		}
		return parseInt(rate_of_fire)
	}

	private validRateOfFire(rof: string): boolean {
		if (rof.match(AttackRollTypeHandler.SHOTGUN_ROF)) return true
		if (parseInt(rof) > 0) return true
		return false
	}
}

class ParryRollTypeHandler extends RollTypeHandler {
	override isValid(data: RollTypeData): boolean {
		return !isNaN(data.item.parry) && data.item.parry !== ""
	}

	override getLevel(data: any): number {
		return data.item.parry
	}

	override getName(data: any): string {
		return LocalizeGURPS.format(LocalizeGURPS.translations.gurps.roll.parry, {
			name: data.item.itemName ?? data.item.formattedName,
		})
	}

	override getType(data: any): RollType {
		return RollType.Attack
	}
}

class BlockRollTypeHandler extends RollTypeHandler {
	override isValid(data: RollTypeData): boolean {
		return !isNaN(data.item.block) && data.item.block !== ""
	}

	override getLevel(data: RollTypeData): number {
		return data.item.block
	}

	override getName(data: RollTypeData): string {
		return LocalizeGURPS.format(LocalizeGURPS.translations.gurps.roll.block, {
			name: data.item.itemName ?? data.item.formattedName,
		})
	}

	override getType(data: RollTypeData): RollType {
		return RollType.Attack
	}
}

class DamageRollTypeHandler extends RollTypeHandler {
	override getName(data: RollTypeData): string {
		return data.item.itemName
			? `${data.item.itemName}${data.item.usage ? ` - ${data.item.usage}` : ""}`
			: `${data.item.formattedName}${data.item.usage ? ` - ${data.item.usage}` : ""}`
	}

	async handleRollType(
		user: StoredDocument<User> | null,
		actor: CharacterGURPS,
		data: RollTypeData,
		_: string,
		hidden: boolean
	): Promise<void> {
		const name = this.getName(data)

		const damageRoll = new DamageRollGURPS(data.item.fastResolvedDamage)

		// Roll the damage for the attack.
		const roll = await damageRoll.roll.evaluate({ async: true })
		const modifierTotal = this.applyMods(0, this.getModifiers(user))
		const total = roll.total! + modifierTotal

		const chatData: Partial<DamagePayload> = {
			name,
			uuid: data.item.uuid,
			attacker: actor.id ?? undefined,
			weaponID: data.item.id ?? undefined,
			damage: damageRoll.displayString,
			dice: damageRoll.dice,
			damageType: damageRoll.damageType,
			armorDivisor: damageRoll.armorDivisorAsInt,
			damageModifier: damageRoll.damageModifier,
			total: total,
			// Create an array of Modifiers suitable for display.
			modifiers: this.addModsDisplayClass(this.getModifiers(user)),
			modifierTotal: modifierTotal,
			hitlocation: DamageRollTypeHandler.getHitLocationFromLastAttackRoll(actor),

			tooltip: await roll.getTooltip(),
		}

		const message = await renderTemplate(`systems/${SYSTEM_NAME}/templates/message/damage-roll.hbs`, chatData)

		let messageData: any = {
			user: user,
			speaker: chatData.attacker,
			type: CONST.CHAT_MESSAGE_TYPES.ROLL,
			content: message,
			roll: JSON.stringify(roll),
			sound: CONFIG.sounds.dice,
		}
		if (hidden) messageData.rollMode = CONST.DICE_ROLL_MODES.PRIVATE

		let userTarget = ""
		if (game.user?.targets.size) {
			userTarget = game.user?.targets.values().next().value.id
		}

		messageData = DamageChat.setTransferFlag(messageData, chatData, userTarget)

		await ChatMessage.create(messageData, {})
		await this.resetMods(user)
	}

	/**
	 * Determine Hit Location. In the future, the Attack roll (above) should be able to determine if there is a modifier
	 * for hit location. If there is, use that. Otherwise go to the world settings to determine the default damage
	 * location. (Or, eventually, we could ask the target for it's default hit location...).
	 *
	 * @param _actor
	 */
	private static getHitLocationFromLastAttackRoll(_actor: ActorGURPS): string {
		return game.settings.get(SYSTEM_NAME, SETTINGS.DEFAULT_DAMAGE_LOCATION) as string
	}
}

class GenericRollTypeHandler extends RollTypeHandler {
	async handleRollType(
		user: StoredDocument<User> | null,
		actor: Actor,
		data: RollTypeData,
		formula: string,
		hidden: boolean
	): Promise<void> {
		const type = data.type
		formula = data.formula

		// Create an array of Modifiers suitable for display.
		const modifiers: Array<RollModifier & { class?: string }> = this.getModifiers(user)
		this.addModsDisplayClass(modifiers)

		const roll = Roll.create(formula) as RollGURPS
		await roll.evaluate({ async: true })

		const total = this.applyMods(roll.total!, modifiers)

		const chatData = {
			formula,
			name: roll.formula,
			total,
			modifiers,
			type,
			tooltip: await roll.getTooltip(),
		}

		const message = await renderTemplate(`systems/${SYSTEM_NAME}/templates/message/generic-roll.hbs`, chatData)

		const messageData: any = {
			user: user,
			type: CONST.CHAT_MESSAGE_TYPES.ROLL,
			content: message,
			roll: JSON.stringify(roll),
			sound: CONFIG.sounds.dice,
		}
		if (actor) messageData.speaker.actor = actor
		if (hidden) messageData.rollMode = CONST.DICE_ROLL_MODES.PRIVATE

		await ChatMessage.create(messageData, {})
		await this.resetMods(user)
	}
}

export type RollTypeData = {
	type: RollType // RollTypeHandler
	modifier: number // AddModifier
	comment: string // AddModifier
	attribute: any
	item: any
	formula: string
	hidden: boolean
}

export const rollTypeHandlers: Record<RollType, RollTypeHandler> = {
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
	[RollType.Generic]: new GenericRollTypeHandler(),
}
