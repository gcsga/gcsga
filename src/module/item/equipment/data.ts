import { Feature } from "@feature/index.ts"
import { ItemGCSCalcValues, ItemGCSSource, ItemGCSSystemData } from "@item/gcs/data.ts"
import { ItemType } from "@module/data/misc.ts"
import { PrereqList } from "@prereq/prereq_list.ts"

export type EquipmentSource = ItemGCSSource<ItemType.Equipment, EquipmentSystemData>

export type CostValueType = "addition" | "percentage" | "multiplier"

export interface EquipmentData extends Omit<EquipmentSource, "effects" | "items">, EquipmentSystemData {
	readonly type: EquipmentSource["type"]
	data: EquipmentSystemData

	readonly _source: EquipmentSource
}

export interface EquipmentSystemData extends Omit<ItemGCSSystemData, "open"> {
	description: string
	prereqs: PrereqList
	equipped: boolean
	quantity: number
	tech_level: string
	legality_class: string
	value: number
	ignore_weight_for_skills: boolean
	weight: string
	uses: number
	max_uses: number
	features: Feature[]
	// other: boolean
	rated_strength: number
	calc?: EquipmentCalcValues
}

export interface EquipmentCalcValues extends ItemGCSCalcValues {
	weight: string
	extended_weight: string
	value: string
	extended_value: string
}
