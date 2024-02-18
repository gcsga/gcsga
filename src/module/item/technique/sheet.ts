import { ItemSheetGCS } from "@item/gcs/sheet.ts"
import { TechniqueGURPS } from "./document.ts"
import { ItemSheetOptions } from "@item/base/sheet.ts"

export class TechniqueSheet<IType extends TechniqueGURPS = TechniqueGURPS> extends ItemSheetGCS<IType> {
	static override get defaultOptions(): ItemSheetOptions {
		const options = super.defaultOptions
		fu.mergeObject(options, {
			classes: options.classes.concat(["technique"]),
		})
		return options
	}
}
