import { ItemGCSCalcValues, ItemGCSSource, ItemGCSSystemData } from "@item/gcs"
import { ItemType } from "@module/data"

export type SpellContainerSource = ItemGCSSource<ItemType.SpellContainer, SpellContainerSystemData>

export interface SpellContainerData extends Omit<SpellContainerSource, "effects" | "items">, SpellContainerSystemData {
	readonly type: SpellContainerSource["type"]
	data: SpellContainerSystemData

	readonly _source: SpellContainerSource
}

export interface SpellContainerSystemData extends ItemGCSSystemData {
	calc?: SpellContainerCalcValues
}

export interface SpellContainerCalcValues extends ItemGCSCalcValues {
	points: number
}
