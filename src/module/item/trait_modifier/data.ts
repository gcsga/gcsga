import { FeatureObj } from "@feature/index.ts"
import { ItemType } from "@item"
import { ItemGCSSource, ItemGCSSystemSource } from "@item/gcs/data.ts"
import { affects } from "@util/enum/affects.ts"
import { tmcost } from "@util/enum/tmcost.ts"

export type TraitModifierSource = ItemGCSSource<ItemType.TraitModifier, TraitModifierSystemSource>

export interface TraitModifierSystemSource extends ItemGCSSystemSource {
	disabled: boolean
	cost_type: tmcost.Type
	cost: number
	levels: number
	affects: affects.Option
	features: FeatureObj[]
}
