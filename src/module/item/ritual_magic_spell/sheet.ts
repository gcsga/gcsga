import { ItemSheetGCS } from "@item/gcs/sheet.ts"
import { RitualMagicSpellGURPS } from "./document.ts"
import { ItemSheetOptions } from "@item/base/sheet.ts"

export class RitualMagicSpellSheet<
	IType extends RitualMagicSpellGURPS = RitualMagicSpellGURPS,
> extends ItemSheetGCS<IType> {
	static override get defaultOptions(): ItemSheetOptions {
		const options = super.defaultOptions
		fu.mergeObject(options, {
			classes: options.classes.concat(["ritual_magic_spell"]),
		})
		return options
	}
}
