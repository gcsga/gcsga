import { NoteContainerGURPS } from "@item"
import { NoteGURPS } from "./document.ts"
import { ItemSheetGCS } from "@item/gcs/sheet.ts"
import { ItemSheetOptions } from "@item/base/sheet.ts"

export class NoteSheet<
	IType extends NoteGURPS | NoteContainerGURPS = NoteGURPS | NoteContainerGURPS,
> extends ItemSheetGCS<IType> {
	static override get defaultOptions(): ItemSheetOptions {
		const options = super.defaultOptions
		fu.mergeObject(options, {
			classes: options.classes.concat(["note"]),
		})
		return options
	}
}
