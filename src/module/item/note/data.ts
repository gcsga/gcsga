import { ItemGCSSource, ItemGCSSystemSource } from "@item/gcs/data.ts"
import { ItemType } from "@item/types.ts"

export type NoteSource = ItemGCSSource<ItemType.Note, NoteSystemSource>

export interface NoteSystemSource extends ItemGCSSystemSource {
	text: string
	type: ItemType.Note
}
