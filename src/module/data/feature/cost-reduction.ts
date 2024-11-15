import { gid } from "@data"
import fields = foundry.data.fields
import { BaseFeature, BaseFeatureSchema } from "./base-feature.ts"
import { feature } from "@util"
import { createButton, createDummyElement } from "@module/applications/helpers.ts"
import { getAttributeChoices } from "../attribute/helpers.ts"

function getCostReductionChoices() {
	return Object.freeze(
		Object.fromEntries(
			[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80].map(value => [
				value,
				game.i18n.format("GURPS.Item.Features.FIELDS.CostReduction.Reduction", { value }),
			]),
		),
	)
}

class CostReduction extends BaseFeature<CostReductionSchema> {
	static override TYPE = feature.Type.CostReduction

	static override defineSchema(): CostReductionSchema {
		const fields = foundry.data.fields

		const attributeChoices = getAttributeChoices(
			null,
			gid.Strength,
			"GURPS.Item.Features.FIELDS.CostReduction.Attribute",
			{
				blank: false,
				ten: false,
				size: true,
				dodge: true,
				parry: true,
				block: true,
				skill: false,
			},
		)

		return {
			...super.defineSchema(),
			attribute: new fields.StringField({
				required: true,
				nullable: false,
				choices: attributeChoices.choices,
				initial: gid.Strength,
			}),
			percentage: new fields.NumberField({
				required: true,
				nullable: false,
				choices: getCostReductionChoices(),
				initial: 40,
			}),
		}
	}

	override toFormElement(enabled: boolean): HTMLElement {
		const element = document.createElement("li")
		const prefix = `system.features.${this.index}`

		element.append(createDummyElement(`${prefix}.temporary`, this.temporary))
		if (!enabled) {
			element.append(createDummyElement(`${prefix}.type`, this.type))
			element.append(createDummyElement(`${prefix}.attribute`, this.attribute))
			element.append(createDummyElement(`${prefix}.percentage`, this.percentage))
		}

		const rowElement = document.createElement("div")
		rowElement.classList.add("form-fields")

		rowElement.append(
			createButton({
				icon: ["fa-regular", "fa-trash"],
				label: "",
				data: {
					deleteFeature: "",
					index: this.index.toString(),
				},
				disabled: !enabled,
			}),
		)

		rowElement.append(
			foundry.applications.fields.createSelectInput({
				name: enabled ? `${prefix}.type` : "",
				value: this.type,
				dataset: {
					selector: "feature-type",
					index: this.index.toString(),
				},
				localize: true,
				options: this.getTypeChoices(),
				disabled: !enabled,
			}),
		)

		rowElement.append(
			this.schema.fields.attribute.toInput({
				name: enabled ? `${prefix}.attribute` : "",
				value: this.attribute,
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)

		rowElement.append(
			this.schema.fields.percentage.toInput({
				name: enabled ? `${prefix}.percentage` : "",
				value: this.percentage.toString(),
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)

		element.append(rowElement)

		return element
	}

	fillWithNameableKeys(_m: Map<string, string>, _existing: Map<string, string>): void {}
}

interface CostReduction extends BaseFeature<CostReductionSchema>, ModelPropsFromSchema<CostReductionSchema> {}

type CostReductionSchema = BaseFeatureSchema & {
	attribute: fields.StringField<string, string, true, false, true>
	percentage: fields.NumberField<number, number, true, false, true>
}

export { CostReduction, type CostReductionSchema }
