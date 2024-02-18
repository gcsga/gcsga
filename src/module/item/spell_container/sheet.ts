import { ItemSheetGCS } from "@item/gcs/sheet.ts"
import { SpellContainerGURPS } from "./document.ts"
import { ItemSheetOptions } from "@item/base/sheet.ts"

export class SpellContainerSheet<IType extends SpellContainerGURPS = SpellContainerGURPS> extends ItemSheetGCS<IType> {
	static override get defaultOptions(): ItemSheetOptions {
		const options = super.defaultOptions
		fu.mergeObject(options, {
			classes: options.classes.concat(["spell_container"]),
		})
		return options
	}
}
