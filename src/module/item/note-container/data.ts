import {
	AbstractContainerSource,
	AbstractContainerSystemData,
	AbstractContainerSystemSource,
} from "@item/abstract-container/data.ts"
import { ItemType } from "@module/data/constants.ts"

type NoteContainerSource = AbstractContainerSource<ItemType.NoteContainer, NoteContainerSystemSource>

interface NoteContainerSystemSource extends AbstractContainerSystemSource {
	type: ItemType.NoteContainer
	text: string
	reference: string
	reference_highlight: string
	open: boolean
}

interface NoteContainerSystemData extends NoteContainerSystemSource, AbstractContainerSystemData {}

export type { NoteContainerSource, NoteContainerSystemData, NoteContainerSystemSource }
