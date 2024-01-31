import { FeatureObj } from "@feature/index.ts"
import { ItemGCSSource, ItemGCSSystemSource } from "@item/gcs/data.ts"
import { ItemType } from "@item/types.ts"
import { PrereqList } from "@prereq/prereq_list.ts"

export type EquipmentContainerSource = ItemGCSSource<ItemType.EquipmentContainer, EquipmentContainerSystemSource>

export interface EquipmentContainerSystemSource extends ItemGCSSystemSource {
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
	features: FeatureObj[]
	rated_strength: number
}
