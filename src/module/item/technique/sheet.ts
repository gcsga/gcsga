import { ItemSheetGCS } from "@item/gcs"
import { TechniqueGURPS } from "./document"

export class TechniqueSheet extends ItemSheetGCS<TechniqueGURPS> {
	static get defaultOptions(): DocumentSheetOptions<Item> {
		const options = super.defaultOptions
		mergeObject(options, {
			classes: options.classes.concat(["technique"]),
		})
		return options
	}

	getData(options?: Partial<DocumentSheetOptions<Item>> | undefined) {
		const data = super.getData(options)
		return mergeObject(data, {
			attributes: {
				...{ 10: "10" },
				...super.getData(options).attributes,
				...{ skill: "Skill" },
			},
			defaults: (this.item as any).defaults,
		})
	}
}
