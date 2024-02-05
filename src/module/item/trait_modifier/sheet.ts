import { ItemSheetGCS } from "@item/gcs/sheet.ts"
import { TraitModifierGURPS } from "./document.ts"
import { ItemSheetDataGURPS, ItemSheetOptions } from "@item/base/sheet.ts"

export class TraitModifierSheet<IType extends TraitModifierGURPS = TraitModifierGURPS> extends ItemSheetGCS<IType> {
	static override get defaultOptions(): DocumentSheetOptions {
		const options = super.defaultOptions
		fu.mergeObject(options, {
			classes: options.classes.concat(["modifier"]),
		})
		return options
	}

	override async getData(options: Partial<ItemSheetOptions> = {}): Promise<ItemSheetDataGURPS<IType>> {
		const data = await super.getData(options)
		const adjustedCostType =
			(this.item as TraitModifierGURPS).system.cost_type === "percentage" &&
			(this.item as TraitModifierGURPS).isLeveled
				? "percentage_leveled"
				: (this.item as TraitModifierGURPS).system.cost_type
		const sheetData = {
			...data,
			data: {
				...data.data,
				...{
					cost_type: adjustedCostType,
				},
			},
		}
		return sheetData
	}

	protected override async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
		if (Object.keys(formData).includes("system.disabled"))
			formData["system.disabled"] = !formData["system.disabled"]

		if (formData["system.cost_type"] === "percentage_leveled") {
			formData["system.levels"] = 1
			formData["system.cost_type"] = "percentage"
		} else {
			formData["system.levels"] = "0"
		}
		return super._updateObject(event, formData)
	}
}
