import { ItemSheetGURPS } from "@item/base/sheet"
import { EquipmentModifierGURPS } from "./document"

export class EquipmentModifierSheet extends ItemSheetGURPS<EquipmentModifierGURPS> {
	static get defaultOptions(): DocumentSheetOptions<Item> {
		const options = super.defaultOptions
		mergeObject(options, {
			classes: options.classes.concat(["eqp_modifier"]),
		})
		return options
	}

	protected _updateObject(event: Event, formData: Record<string, any>): Promise<unknown> {
		if (Object.keys(formData).includes("system.disabled"))
			formData["system.disabled"] = !formData["system.disabled"]

		return super._updateObject(event, formData)
	}

	render(
		force?: boolean | undefined,
		options?: Application.RenderOptions<DocumentSheetOptions<Item>> | undefined
	): this {
		if (this.item.container?.sheet?.rendered) this.item.container.sheet.render()
		return super.render(force, options)
	}
}
