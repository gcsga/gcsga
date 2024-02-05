import { ItemType } from "@data"
import { BaseContainerSource } from "@item/container/data.ts"
import { ItemGCSSystemSource } from "@item/gcs/data.ts"

export type NoteSource = BaseContainerSource<ItemType.Note, NoteSystemSource>

export interface NoteSystemSource extends ItemGCSSystemSource {
	type: ItemType.Note
	text: string
	reference: string
	reference_highlight: string
}
