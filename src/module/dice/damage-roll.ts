import { ItemType } from "@module/data/constants.ts"
import { BaseRollGURPS, BaseRollOptions } from "./base-roll.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { type ItemInst } from "@module/data/item/helpers.ts"
import { DAMAGE_TYPE } from "@module/apps/damage-calculator/damage-type.ts"

class DamageRoll extends BaseRollGURPS {
	constructor(formula: string, data: Record<string, unknown>, options: DamageRollOptions) {
		super(formula, data, options)
	}

	get item(): ItemInst<ItemType.WeaponMelee | ItemType.WeaponRanged> | null {
		if (!this.options.item) return null
		const itemType = this.options.item.type
		if (itemType === "thrust" || itemType === "swing") return null

		const item = fromUuidSync(this.options.item.uuid)
		if (!(item instanceof ItemGURPS2)) return null

		if (item.type === ItemType.WeaponMelee || item.type === ItemType.WeaponRanged)
			return item as ItemInst<ItemType.WeaponMelee | ItemType.WeaponRanged>
		console.error("Damage Roll item is not a weapon")
		return null
	}

	override get total(): number | undefined {
		const total = super.total
		if (!Number.isNumeric(total)) return total
		return total! + this.modifierTotal
	}

	get damageType(): DAMAGE_TYPE {
		const item = this.item
		if (item === null) return DAMAGE_TYPE.Injury
		const type = item.system.damage.type
		for (const value of Object.values(DAMAGE_TYPE)) {
			if (type === value) return value as DAMAGE_TYPE
		}
		console.error(`Damage Type "${type}" is invalid. Defaulting to Injury.`)
		return DAMAGE_TYPE.Injury
	}

	get armorDivisor(): number {
		const item = this.item
		if (item === null) return 1
		return item.system.damage.armor_divisor
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
}

export { DamageRoll, type DamageRollOptions }
