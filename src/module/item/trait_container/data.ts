import { ItemGCSSource, ItemGCSSystemSource } from "@item/gcs/data.ts"
import { ItemType } from "@item/types.ts"
import { selfctrl } from "@util/enum/selfctrl.ts"

export type TraitContainerSource = ItemGCSSource<ItemType.TraitContainer, TraitContainerSystemSource>

export interface TraitContainerSystemSource extends ItemGCSSystemSource {
	disabled: boolean
	container_type: TraitContainerType
	cr: selfctrl.Roll
	cr_adj: selfctrl.Adjustment
}

export enum TraitContainerType {
	Group = "group",
	MetaTrait = "meta_trait",
	Ancestry = "ancestry",
	Attributes = "attributes",
	AlternativeAbilities = "alternative_abilities",
}
