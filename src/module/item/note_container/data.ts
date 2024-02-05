import { ItemType } from "@data"
import { BaseContainerSource } from "@item/container/data.ts"
import { ItemGCSSystemSource } from "@item/gcs/data.ts"

export type NoteContainerSource = BaseContainerSource<ItemType.NoteContainer, NoteContainerSystemSource>

export interface NoteContainerSystemSource extends ItemGCSSystemSource {
	type: ItemType.NoteContainer
	text: string
	reference: string
	reference_highlight: string
}
