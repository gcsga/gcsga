import { ItemGCSCalcValues, ItemGCSSource, ItemGCSSystemData } from "@item/gcs"
import { ItemType } from "@module/data"
import { selfctrl } from "@util/enum"

export type TraitContainerSource = ItemGCSSource<ItemType.TraitContainer, TraitContainerSystemData>

export interface TraitContainerData extends Omit<TraitContainerSource, "effects" | "items">, TraitContainerSystemData {
	readonly type: TraitContainerSource["type"]
	data: TraitContainerSystemData
	readonly _source: TraitContainerSource
}

export interface TraitContainerSystemData extends ItemGCSSystemData {
	disabled: boolean
	container_type: TraitContainerType
	cr: selfctrl.Roll
	cr_adj: selfctrl.Adjustment
	calc?: TraitContainerCalcValues
}

export interface TraitContainerCalcValues extends ItemGCSCalcValues {
	enabled: boolean
	points: number
}

export enum TraitContainerType {
	Group = "group",
	MetaTrait = "meta_trait",
	Ancestry = "ancestry",
	Attributes = "attributes",
	AlternativeAbilities = "alternative_abilities",
}
