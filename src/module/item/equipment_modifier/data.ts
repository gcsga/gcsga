import { FeatureObj } from "@feature/index.ts"
import { ItemType } from "@item"
import { ItemGCSSource, ItemGCSSystemSource } from "@item/gcs/data.ts"
import { emcost } from "@util/enum/emcost.ts"
import { emweight } from "@util/enum/emweight.ts"

export type EquipmentModifierSource = ItemGCSSource<ItemType.EquipmentModifier, EquipmentModifierSystemSource>

export interface EquipmentModifierData extends Omit<EquipmentModifierSource, "effects">, EquipmentModifierSystemSource {
	readonly type: EquipmentModifierSource["type"]
	data: EquipmentModifierSystemSource

	readonly _source: EquipmentModifierSource
}

export interface EquipmentModifierSystemSource extends ItemGCSSystemSource {
	cost_type: emcost.Type
	cost: string
	weight_type: emweight.Type
	weight: string
	tech_level: string
	features: FeatureObj[]
	disabled: boolean
}
