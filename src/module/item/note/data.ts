import { ItemGCSCalcValues, ItemGCSSource, ItemGCSSystemData } from "@item/gcs"
import { ItemType } from "@module/data"

export type NoteSource = ItemGCSSource<ItemType.Note, NoteSystemData>

export interface NoteData extends Omit<NoteSource, "effects">, NoteSystemData {
	readonly type: NoteSource["type"]
	data: NoteSystemData

	readonly _source: NoteSource
}

export interface NoteSystemData extends ItemGCSSystemData {
	text: string
	type: ItemType.Note
	calc?: NoteCalcValues
}

export interface NoteCalcValues extends ItemGCSCalcValues {
	resolved_text: string
}
