import { ItemSheetGCS } from "@item/gcs/sheet.ts"
import { TraitModifierContainerGURPS } from "./document.ts"
import { ItemSheetOptions } from "@item/base/sheet.ts"

export class TraitModifierContainerSheet<
	IType extends TraitModifierContainerGURPS = TraitModifierContainerGURPS,
> extends ItemSheetGCS<IType> {
	static override get defaultOptions(): ItemSheetOptions {
		const options = super.defaultOptions
		fu.mergeObject(options, {
			classes: options.classes.concat(["modifier_container"]),
		})
		return options
	}
}
