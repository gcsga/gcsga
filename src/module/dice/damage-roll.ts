import { ActionType, ItemType } from "@module/data/constants.ts"
import { BaseRollGURPS, BaseRollOptions } from "./base-roll.ts"
import { ItemGURPS2 } from "@module/documents/item.ts"
import { ItemTemplateInst } from "@module/data/item/helpers.ts"
import { DAMAGE_TYPE } from "@module/apps/damage-calculator/damage-type.ts"
import { AttackRanged } from "@module/data/action/attack-ranged.ts"
import { AttackMelee } from "@module/data/action/attack-melee.ts"
import { ItemTemplateType } from "@module/data/item/types.ts"

class DamageRoll extends BaseRollGURPS {
	constructor(formula: string, data: Record<string, unknown>, options: DamageRollOptions) {
		super(formula, data, options)
	}

	get action(): AttackMelee | AttackRanged | null {
		if (!this.options.item || !this.options.action) return null
		const itemType = this.options.item.type
		if (itemType === "thrust" || itemType === "swing") return null

		const item = fromUuidSync(this.options.item.uuid)
		if (!(item instanceof ItemGURPS2)) return null
		if (!item.hasTemplate(ItemTemplateType.Action)) return null

		const action = item.system.actions.get(this.options.action.id) ?? null
		if (action === null) return null
		if (action.type === ActionType.AttackMelee || action.type === ActionType.AttackRanged)
			return action as AttackMelee | AttackRanged

		console.error("Damage Roll action is not an attack")
		return null
	}

	get item(): ItemTemplateInst<ItemTemplateType.Action> | null {
		if (!this.options.item) return null
		const itemType = this.options.item.type
		if (itemType === "thrust" || itemType === "swing") return null

		const item = fromUuidSync(this.options.item.uuid)
		if (!(item instanceof ItemGURPS2)) return null
		if (!item.hasTemplate(ItemTemplateType.Action)) {
			console.error("Damage Roll item cannot accept Actions")
			return null
		}
		return item as any
	}

	override get total(): number | undefined {
		const total = super.total
		if (!Number.isNumeric(total)) return total
		return total! + this.modifierTotal
	}

	get damageType(): DAMAGE_TYPE {
		const action = this.action
		if (action === null) return DAMAGE_TYPE.Injury
		const type = action.damage.type
		for (const value of Object.values(DAMAGE_TYPE)) {
			if (type === value) return value as DAMAGE_TYPE
		}
		console.error(`Damage Type "${type}" is invalid. Defaulting to Injury.`)
		return DAMAGE_TYPE.Injury
	}

	get armorDivisor(): number {
		const action = this.action
		if (action === null) return 1
		return action.damage.armor_divisor
	}
}

interface DamageRoll extends BaseRollGURPS {
	options: DamageRollOptions
}

type DamageRollOptions = BaseRollOptions & {
	type?: string
	actor: ActorUUID
	item?: {
		type: ItemType | "thrust" | "swing"
		uuid: ItemUUID
		level: number
		name?: string
		specialization?: string
	}
	action?: {
		type: ActionType
		id: string
		level: number
		name?: string
	}
}

export { DamageRoll, type DamageRollOptions }
