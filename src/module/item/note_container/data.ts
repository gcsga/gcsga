import { ItemGCSSource, ItemGCSSystemSource } from "@item/gcs/data.ts"
import { ItemType } from "@item/types.ts"

export type NoteContainerSource = ItemGCSSource<ItemType.NoteContainer, NoteContainerSystemSource>

export interface NoteContainerSystemSource extends ItemGCSSystemSource {
	type: ItemType.NoteContainer
	text: string
	reference: string
	reference_highlight: string
}
