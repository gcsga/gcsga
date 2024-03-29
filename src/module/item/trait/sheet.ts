import { ItemSheetGCS } from "@item/gcs/sheet.ts"
import { TraitGURPS } from "./document.ts"
import { ItemSheetDataGURPS, ItemSheetOptions } from "@item/base/sheet.ts"

export class TraitSheet<IType extends TraitGURPS = TraitGURPS> extends ItemSheetGCS<IType> {
	static override get defaultOptions(): DocumentSheetOptions {
		const options = super.defaultOptions
		fu.mergeObject(options, {
			classes: options.classes.concat(["trait"]),
		})
		return options
	}

	override async getData(options: Partial<ItemSheetOptions> = {}): Promise<ItemSheetDataGURPS<IType>> {
		const data = await super.getData(options)
		data.modifiers = this.object.modifiers
		return data
	}

	protected override async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
		if (Object.keys(formData).includes("system.disabled"))
			formData["system.disabled"] = !formData["system.disabled"]
		return super._updateObject(event, formData)
	}
}
