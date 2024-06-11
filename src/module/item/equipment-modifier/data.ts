import { BaseItemSourceGURPS, ItemSystemData, ItemSystemSource } from "@item/base/data.ts"
import { ItemType } from "@module/data/constants.ts"
import { FeatureObj } from "@system"
import { emcost, emweight } from "@util"

type EquipmentModifierSource = BaseItemSourceGURPS<ItemType.EquipmentModifier, EquipmentModifierSystemSource>

interface EquipmentModifierSystemSource extends ItemSystemSource {
	type: ItemType.EquipmentModifier
	name: string
	reference: string
	reference_highlight: string
	notes: string
	vtt_notes: string
	tags: string[]
	cost_type: emcost.Type
	weight_type: emweight.Type
	disabled: boolean
	tech_level: string
	cost: string
	weight: string
	features: FeatureObj[]
}

interface EquipmentModifierSystemData extends EquipmentModifierSystemSource, ItemSystemData {}

export type { EquipmentModifierSource, EquipmentModifierSystemData, EquipmentModifierSystemSource }
