import { FeatureObj } from "@feature/index.ts"
import { ItemGCSSource, ItemGCSSystemData } from "@item/gcs/data.ts"
import { ItemType } from "@module/data/misc.ts"
import { emcost } from "@util/enum/emcost.ts"
import { emweight } from "@util/enum/emweight.ts"

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
	features: FeatureObj[]
	disabled: boolean
}
