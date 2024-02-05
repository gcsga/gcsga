import { ItemSheetGCS } from "@item/gcs/sheet.ts"
import { ItemSheetDataGURPS, ItemSheetOptions } from "@item/base/sheet.ts"
import { TraitContainerGURPS } from "./document.ts"

export class TraitContainerSheet<IType extends TraitContainerGURPS = TraitContainerGURPS> extends ItemSheetGCS<IType> {
	static override get defaultOptions(): DocumentSheetOptions {
		const options = super.defaultOptions
		fu.mergeObject(options, {
			classes: options.classes.concat(["trait_container"]),
		})
		return options
	}

	override async getData(options: Partial<ItemSheetOptions> = {}): Promise<ItemSheetDataGURPS<IType>> {
		const data = super.getData(options)
		const modifiers = this.object.modifiers
		return fu.mergeObject(data, {
			modifiers,
		})
	}

	protected override async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
		if (Object.keys(formData).includes("system.disabled"))
			formData["system.disabled"] = !formData["system.disabled"]
		return super._updateObject(event, formData)
	}
}
