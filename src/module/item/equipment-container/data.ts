import { BaseItemSourceGURPS, ItemSystemData, ItemSystemSource } from "@item/base/data.ts"
import { EquipmentFlags } from "@item/equipment/data.ts"
import { ItemType } from "@module/data/constants.ts"
import { FeatureObj, PrereqListObj } from "@system"
import { WeightString } from "@util"

type EquipmentContainerSource = BaseItemSourceGURPS<ItemType.EquipmentContainer, EquipmentContainerSystemSource> & {
	flags: DeepPartial<EquipmentFlags>
}

interface EquipmentContainerSystemSource extends ItemSystemSource {
	type: ItemType.EquipmentContainer
	description: string
	reference: string
	reference_highlight: string
	notes: string
	vtt_notes: string
	tech_level: string
	legality_class: string
	tags: string[]
	rated_strength?: number
	quantity: number
	value: number
	weight: WeightString
	max_uses: number
	uses: number
	prereqs: PrereqListObj
	features: FeatureObj[]
	equipped: boolean
	ignore_weight_for_skills: boolean
	open: boolean
}

interface EquipmentContainerSystemData extends EquipmentContainerSystemSource, ItemSystemData {}

export type { EquipmentContainerSource, EquipmentContainerSystemData, EquipmentContainerSystemSource }
