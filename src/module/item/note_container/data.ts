import { ItemGCSSource, ItemGCSSystemSource } from "@item/gcs/data.ts"
import { ItemType } from "@item/types.ts"

export type NoteContainerSource = ItemGCSSource<ItemType.NoteContainer, NoteContainerSystemSource>

export interface NoteContainerSystemSource extends ItemGCSSystemSource {
	text: string
}
