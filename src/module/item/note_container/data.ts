import { ItemGCSSource, ItemGCSSystemData } from "@item/gcs/data.ts"
import { NoteCalcValues } from "@item/note/data.ts"
import { ItemType } from "@module/data/misc.ts"

export type NoteContainerSource = ItemGCSSource<ItemType.NoteContainer, NoteContainerSystemData>

export interface NoteContainerData extends Omit<NoteContainerSource, "effects" | "items">, NoteContainerSystemData {
	readonly type: NoteContainerSource["type"]
	data: NoteContainerSystemData

	readonly _source: NoteContainerSource
}

export interface NoteContainerSystemData extends ItemGCSSystemData {
	text: string
	calc?: NoteCalcValues
}
