import { ItemType, SYSTEM_NAME } from "@module/data/constants.ts"
import { BaseRollGURPS, BaseRollOptions } from "./base-roll.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { selfctrl } from "@util"
import { SkillDefaultSchema } from "@module/data/item/compontents/skill-default.ts"
import { WeaponROFSchema } from "@module/data/item/fields/weapon-rof.ts"
import { WeaponRecoilSchema } from "@module/data/item/fields/weapon-recoil.ts"
import { ActorGURPS2 } from "@module/document/actor.ts"
import { ActorTemplateType } from "@module/data/actor/types.ts"

class SuccessRoll extends BaseRollGURPS {
	static override CHAT_TEMPLATE = `systems/${SYSTEM_NAME}/templates/roll/success-roll.hbs`
	static override TOOLTIP_TEMPLATE = `systems/${SYSTEM_NAME}/templates/roll/success-roll-tooltip.hbs`

	constructor(formula: string, data: Record<string, unknown>, options: SuccessRollOptions) {
		super(formula, data, options)
	}

	get rollMargin(): number | null {
		if (!this._evaluated) return null
		return Math.abs(this.effectiveTarget - this.dice[0].total!)
	}

	get isCriticalSuccess(): boolean | null {
		if (!this._evaluated) return null
		const total = this.dice[0].total!
		switch (true) {
			case this.effectiveTarget > 16:
				return total <= 6
			case this.effectiveTarget > 15:
				return total <= 5
			default:
				return total <= 4
		}
	}

	get isSuccess(): boolean | null {
		if (!this._evaluated) return null
		if (!this.isCriticalFailure) return false
		return this.isCriticalSuccess || this.dice[0].total! <= this.effectiveTarget
	}

	get isCriticalFailure(): boolean | null {
		if (!this._evaluated) return null
		const total = this.dice[0].total!
		if (total === 18) return true
		if (total === 17 && this.effectiveTarget <= 15) return true
		if (total - 10 >= this.effectiveTarget) return true
		return false
	}

	get isFailure(): boolean | null {
		if (!this._evaluated) return null
		return !this.isSuccess
	}

	get effectiveTarget(): number {
		let effectiveTarget = this.options.target || this._getTargetFromItem(this.options)
		return (effectiveTarget += this.modifierTotal)
	}

	protected _getTargetFromItem(options: SuccessRollOptions): number {
		if (!options.item) return 0
		const item = fromUuid(options.item.uuid)
		if (!(item instanceof ItemGURPS2)) {
			if (options.item.type !== "attribute") return 0
			const actor = fromUuid(options.actor)
			if (!(actor instanceof ActorGURPS2)) return 0
			if (!actor.hasTemplate(ActorTemplateType.Attributes)) return 0

			const attributeLevel = actor.system.resolveAttributeCurrent(options.item.uuid)
			if (attributeLevel === Number.MIN_SAFE_INTEGER) return 0
			return attributeLevel
		}
		switch (true) {
			case item.isOfType(ItemType.Trait):
				return item.system.cr
			case item.isOfType(ItemType.Skill, ItemType.Technique, ItemType.Spell, ItemType.RitualMagicSpell):
				return item.system.level.level
			case item.isOfType(ItemType.WeaponMelee, ItemType.WeaponRanged):
				return item.system.level
		}
		return 0
	}

	protected _getItemData(options: SuccessRollOptions): RollItemData | object {
		if (!options.item) return {}
		const data: Partial<RollItemData> = {
			type: options.item.type,
			uuid: options.item.uuid,
		}
		const item = fromUuid(options.item.uuid)
		if (!(item instanceof ItemGURPS2)) {
			if (data.type !== "attribute") return data
			const actor = fromUuid(options.actor)
			if (!(actor instanceof ActorGURPS2)) return data
			if (!actor.hasTemplate(ActorTemplateType.Attributes)) return data

			const attribute = actor.system.resolveAttribute(options.item.uuid)
			if (attribute === null) return data

			data.name = attribute.definition?.fullName
			return data
		}
		switch (true) {
			case item.isOfType(ItemType.Trait): {
				data.name = item.system.nameWithReplacements
				data.cr = item.system.cr
				break
			}
			case item.isOfType(ItemType.Skill, ItemType.Technique): {
				data.name = item.system.nameWithReplacements
				data.specialization = item.system.specializationWithReplacements
				data.defaults = item.system.defaults
				break
			}
			case item.isOfType(ItemType.Spell, ItemType.RitualMagicSpell): {
				data.name = item.system.nameWithReplacements
				break
			}
			case item.isOfType(ItemType.WeaponMelee, ItemType.WeaponRanged): {
				data.name = item.system.processedName
				data.usage = item.system.usageWithReplacements
				data.defaults = item.system.defaults
				data.damage = item.system.damage.resolvedValue(null)
				if (item.isOfType(ItemType.WeaponRanged)) {
					data.ROF = item.system.rate_of_fire.toObject()
					data.recoil = item.system.recoil.toObject()
				}
			}
		}
		return data
	}

	override async toMessage(
		messageData: PreCreate<foundry.documents.ChatMessageSource> | undefined,
		options: { rollMode?: RollMode | "roll"; create: false },
	): Promise<foundry.documents.ChatMessageSource>
	override async toMessage(
		messageData: PreCreate<foundry.documents.ChatMessageSource>,
		options: { rollMode?: RollMode | "roll"; create?: true },
	): Promise<ChatMessage>
	override async toMessage(
		messageData: PreCreate<foundry.documents.ChatMessageSource> = {},
		options: { rollMode?: RollMode | "roll"; create?: boolean } = {},
	): Promise<ChatMessage | foundry.documents.ChatMessageSource> {
		// Record the preferred rollMode
		options.rollMode ??= this.options.rollMode
		if (options.rollMode === "roll") options.rollMode = undefined
		options.rollMode ||= game.settings.get("core", "rollMode")

		// Evaluate the roll now so we have the results available to determine whether reliable talent came into play
		if (!this._evaluated)
			await this.evaluate({ allowInteractive: options.rollMode !== CONST.DICE_ROLL_MODES.BLIND })

		// Add flavor text if any
		messageData.flavor = messageData.flavor || this.options.flavor

		// Add Item Data
		messageData.flags ??= {}
		messageData.flags[SYSTEM_NAME] ??= {}
		messageData.flags[SYSTEM_NAME].item = this._getItemData(this.options)

		return super.toMessage(messageData, options)
	}
}

interface SuccessRoll extends BaseRollGURPS {
	options: SuccessRollOptions
}

type SuccessRollOptions = BaseRollOptions & {
	target?: number
	actor: ActorUUID
	item?: {
		type: ItemType | "attribute"
		uuid: ItemUUID | string
		level: number
		name?: string
		specialization?: string
	}
}

type RollItemData =
	| TraitRollItemData
	| SkillRollItemData
	| WeaponRollItemData
	| AttributeRollItemData
	| OtherRollItemData

type BaseRollItemData<TType extends ItemType | "attribute"> = {
	type: TType
	uuid: ItemUUID | string
}

type TraitRollItemData = BaseRollItemData<ItemType.Trait> & {
	name: string
	cr: selfctrl.Roll
}

type SkillRollItemData = BaseRollItemData<ItemType.Skill | ItemType.Technique> & {
	name: string
	specialization: string
	defaults: SourceFromSchema<SkillDefaultSchema>[]
}

type WeaponRollItemData = BaseRollItemData<ItemType.WeaponMelee | ItemType.WeaponRanged> & {
	name: string
	usage: string
	damage: string
	ROF?: SourceFromSchema<WeaponROFSchema>
	recoil?: SourceFromSchema<WeaponRecoilSchema>
}

type AttributeRollItemData = BaseRollItemData<"attribute"> & {
	name: string
}

type OtherRollItemData = BaseRollItemData<ItemType | "attribute"> & { [key: string]: unknown }

export { SuccessRoll }
export type { SuccessRollOptions, TraitRollItemData, SkillRollItemData, WeaponRollItemData }
