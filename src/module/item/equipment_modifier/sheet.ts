import { ItemSheetGURPS } from "@item/base/sheet"
import { EquipmentModifierGURPS } from "./document"
import { emcost, emweight } from "@util/enum"

export class EquipmentModifierSheet extends ItemSheetGURPS<EquipmentModifierGURPS> {
	static get defaultOptions(): DocumentSheetOptions<Item> {
		const options = super.defaultOptions
		mergeObject(options, {
			classes: options.classes.concat(["eqp_modifier"]),
		})
		return options
	}

	protected _updateObject(event: Event, formData: Record<string, any>): Promise<unknown> {
		console.log(formData)
		if (Object.keys(formData).includes("system.disabled"))
			formData["system.disabled"] = !formData["system.disabled"]
		const costType: emcost.Type = formData["system.cost_type"]
		const costValueType: emcost.Value = emcost.Type.determineModifierCostValueTypeFromString(
			costType,
			formData["system.cost"],
		)
		const costValue = emcost.Value.extractValue(costValueType, formData["system.cost"])
		formData["system.cost"] = emcost.Value.format(costValueType, costValue)

		const weightType: emweight.Type = formData["system.weight_type"]
		const weightValueType: emweight.Value = emweight.Type.determineModifierWeightValueTypeFromString(
			weightType,
			formData["system.weight"],
		)
		const fraction = emweight.Value.extractFraction(weightValueType, formData["system.weight"])
		formData["system.weight"] = emweight.Value.format(weightValueType, fraction)

		return super._updateObject(event, formData)
	}

	render(
		force?: boolean | undefined,
		options?: Application.RenderOptions<DocumentSheetOptions<Item>> | undefined,
	): this {
		if (this.item.container?.sheet?.rendered) this.item.container.sheet.render()
		return super.render(force, options)
	}
}
