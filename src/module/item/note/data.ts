import { BaseItemSourceGURPS, ItemSystemData, ItemSystemSource } from "@item/base/data.ts"
import { ItemType } from "@module/data/constants.ts"

type NoteSource = BaseItemSourceGURPS<ItemType.Note, NoteSystemSource>

interface NoteSystemSource extends ItemSystemSource {
	type: ItemType.Note
	text: string
	reference: string
	reference_highlight: string
}

interface NoteSystemData extends NoteSystemSource, ItemSystemData {}

export type { NoteSource, NoteSystemData, NoteSystemSource }
