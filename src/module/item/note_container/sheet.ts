import { ItemSheetGCS } from "@item/gcs/sheet.ts"
import { NoteContainerGURPS } from "./document.ts"
import { ItemSheetOptions } from "@item/base/sheet.ts"

export class NoteContainerSheet<IType extends NoteContainerGURPS = NoteContainerGURPS> extends ItemSheetGCS<IType> {
	static override get defaultOptions(): ItemSheetOptions {
		const options = super.defaultOptions
		fu.mergeObject(options, {
			classes: options.classes.concat(["note_container"]),
		})
		return options
	}
}
