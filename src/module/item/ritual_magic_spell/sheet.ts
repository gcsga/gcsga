import { ItemSheetGCS } from "@item/gcs"
import { RitualMagicSpellGURPS } from "./document"

export class RitualMagicSpellSheet extends ItemSheetGCS<RitualMagicSpellGURPS> {
	static get defaultOptions(): DocumentSheetOptions<Item> {
		const options = super.defaultOptions
		mergeObject(options, {
			classes: options.classes.concat(["ritual_magic_spell"]),
		})
		return options
	}

	getData(options?: Partial<DocumentSheetOptions<Item>> | undefined) {
		const data = super.getData(options)
		return mergeObject(data, {
			attributes: {
				...{ 10: "10" },
				...super.getData(options).attributes,
			},
			defaults: (this.item as any).defaults,
		})
	}
}
