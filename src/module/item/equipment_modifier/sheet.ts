import { ItemSheetGURPS, ItemSheetOptions } from "@item/base/sheet.ts"
import { EquipmentModifierGURPS } from "./document.ts"
import { emcost } from "@util/enum/emcost.ts"
import { emweight } from "@util/enum/emweight.ts"

export class EquipmentModifierSheet<
	IType extends EquipmentModifierGURPS = EquipmentModifierGURPS,
> extends ItemSheetGURPS<IType> {
	static override get defaultOptions(): ItemSheetOptions {
		const options = super.defaultOptions
		fu.mergeObject(options, {
			classes: options.classes.concat(["eqp_modifier"]),
		})
		return options
	}

	protected override async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
		if (Object.keys(formData).includes("system.disabled"))
			formData["system.disabled"] = !formData["system.disabled"]
		const costType = formData["system.cost_type"] as emcost.Type
		const costValueType = emcost.Type.determineModifierCostValueTypeFromString(
			costType,
			formData["system.cost"] as string,
		)
		const costValue = emcost.Value.extractValue(costValueType, formData["system.cost"] as string)
		formData["system.cost"] = emcost.Value.format(costValueType, costValue)

		const weightType = formData["system.weight_type"] as emweight.Type
		const weightValueType = emweight.Type.determineModifierWeightValueTypeFromString(
			weightType,
			formData["system.weight"] as string,
		)
		const fraction = emweight.Value.extractFraction(weightValueType, formData["system.weight"] as string)
		formData["system.weight"] = emweight.Value.format(weightValueType, fraction)

		return super._updateObject(event, formData)
	}

	override render(force?: boolean, options?: RenderOptions): this | Promise<this> {
		if (this.item.container instanceof CompendiumCollection) return super.render(force, options)
		if (this.item.container?.sheet?.rendered) this.item.container.sheet.render()
		return super.render(force, options)
	}
}
