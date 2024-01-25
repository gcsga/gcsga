import { Feature } from "@feature/index.ts"
import { ItemGCSSource, ItemGCSSystemData } from "@item/gcs/data.ts"
import { ItemType } from "@module/data/misc.ts"
import { affects } from "@util/enum/affects.ts"
import { tmcost } from "@util/enum/tmcost.ts"

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
