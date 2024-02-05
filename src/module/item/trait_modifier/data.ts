import { ItemType } from "@data"
import { FeatureObj } from "@feature/index.ts"
import { BaseContainerSource } from "@item/container/data.ts"
import { ItemGCSSystemSource } from "@item/gcs/data.ts"
import { affects } from "@util/enum/affects.ts"
import { tmcost } from "@util/enum/tmcost.ts"

export type TraitModifierSource = BaseContainerSource<ItemType.TraitModifier, TraitModifierSystemSource>

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
