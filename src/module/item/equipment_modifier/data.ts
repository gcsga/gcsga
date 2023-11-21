import { ItemGCSSource, ItemGCSSystemData } from "@item/gcs"
import { Feature } from "@module/config"
import { ItemType } from "@module/data"
import { EquipmentModifierWeightType } from "./weight"
import { EquipmentModifierCostType } from "./cost"

export type EquipmentModifierSource = ItemGCSSource<ItemType.EquipmentModifier, EquipmentModifierSystemData>

export interface EquipmentModifierData extends Omit<EquipmentModifierSource, "effects">, EquipmentModifierSystemData {
	readonly type: EquipmentModifierSource["type"]
	data: EquipmentModifierSystemData

	readonly _source: EquipmentModifierSource
}

export interface EquipmentModifierSystemData extends ItemGCSSystemData {
	cost_type: EquipmentModifierCostType
	cost: string
	weight_type: EquipmentModifierWeightType
	weight: string
	tech_level: string
	features: Feature[]
	disabled: boolean
}

export { EquipmentModifierWeightType }

