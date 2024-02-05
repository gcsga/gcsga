import { FeatureObj } from "@feature/index.ts"
import { ItemType } from "@item"
import { ItemGCSSource, ItemGCSSystemSource } from "@item/gcs/data.ts"
import { emcost } from "@util/enum/emcost.ts"
import { emweight } from "@util/enum/emweight.ts"

export type EquipmentModifierSource = ItemGCSSource<ItemType.EquipmentModifier, EquipmentModifierSystemSource>

export interface EquipmentModifierSystemSource extends ItemGCSSystemSource {
	type: ItemType.EquipmentModifier
	name?: string
	reference?: string
	reference_highlight?: string
	notes?: string
	vtt_notes?: string
	tags?: string[]
	cost_type?: emcost.Type
	weight_type?: emweight.Type
	disabled?: boolean
	tech_level?: string
	cost?: string
	weight?: string
	features?: FeatureObj[]
}
