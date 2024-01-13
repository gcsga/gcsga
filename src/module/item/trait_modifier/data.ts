import { ItemGCSSource, ItemGCSSystemData } from "@item/gcs"
import { Feature } from "@module/config"
import { ItemType } from "@module/data"
import { affects, tmcost } from "@util/enum"

export type TraitModifierSource = ItemGCSSource<ItemType.TraitModifier, TraitModifierSystemData>

export interface TraitModifierData extends Omit<TraitModifierSource, "effects">, TraitModifierSystemData {
	readonly type: TraitModifierSource["type"]
	data: TraitModifierSystemData

	readonly _source: TraitModifierSource
}

export interface TraitModifierSystemData extends ItemGCSSystemData {
	disabled: boolean
	cost_type: tmcost.Type
	cost: number
	levels: number
	affects: affects.Option
	features: Feature[]
}
