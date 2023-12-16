import { ItemSheetGURPS } from "@item/base"
import { NoteContainerGURPS } from "@item/note_container"
import { NoteGURPS } from "./document"

export class NoteSheet extends ItemSheetGURPS<NoteGURPS | NoteContainerGURPS> {
	static get defaultOptions(): DocumentSheetOptions<Item> {
		const options = super.defaultOptions
		mergeObject(options, {
			classes: options.classes.concat(["note"]),
		})
		return options
	}
}
