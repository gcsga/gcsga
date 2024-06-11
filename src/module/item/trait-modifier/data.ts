import { BaseItemSourceGURPS, ItemSystemData, ItemSystemSource } from "@item/base/data.ts"
import { ItemType } from "@module/data/constants.ts"
import { FeatureObj } from "@system"
import { affects, tmcost } from "@util"

type TraitModifierSource = BaseItemSourceGURPS<ItemType.TraitModifier, TraitModifierSystemSource>

interface TraitModifierSystemSource extends ItemSystemSource {
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

interface TraitModifierSystemData extends TraitModifierSystemSource, ItemSystemData {}

export type { TraitModifierSource, TraitModifierSystemData, TraitModifierSystemSource }
