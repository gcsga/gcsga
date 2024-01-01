import { ItemGCSSource, ItemGCSSystemData } from "@item/gcs"
import { Feature } from "@module/config"
import { ItemType } from "@module/data"
import { emcost, emweight } from "@util/enum"

export type EquipmentModifierSource = ItemGCSSource<ItemType.EquipmentModifier, EquipmentModifierSystemData>

export interface EquipmentModifierData extends Omit<EquipmentModifierSource, "effects">, EquipmentModifierSystemData {
	readonly type: EquipmentModifierSource["type"]
	data: EquipmentModifierSystemData

	readonly _source: EquipmentModifierSource
}

export interface EquipmentModifierSystemData extends ItemGCSSystemData {
	cost_type: emcost.Type
	cost: string
	weight_type: emweight.Type
	weight: string
	tech_level: string
	features: Feature[]
	disabled: boolean
}
