import { FeatureObj } from "@feature/index.ts"
import { ItemType } from "@item"
import { ItemGCSSource, ItemGCSSystemSource } from "@item/gcs/data.ts"
import { affects } from "@util/enum/affects.ts"
import { tmcost } from "@util/enum/tmcost.ts"

export type TraitModifierSource = ItemGCSSource<ItemType.TraitModifier, TraitModifierSystemSource>

export interface TraitModifierSystemSource extends ItemGCSSystemSource {
	type: ItemType.TraitModifier
	name: string
	reference: string
	reference_highlight: string
	notes: string
	vtt_notes: string
	tags: string[]
	cost: number
	levels: number
	affects: affects.Option
	cost_type: tmcost.Type
	disabled: boolean
	features: FeatureObj[]
}
