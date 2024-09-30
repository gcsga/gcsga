import { createButton } from "@module/applications/helpers.ts"
import { BaseFeature, BaseFeatureSchema } from "./base-feature.ts"
import { Int, Weight, feature } from "@util"
import { SheetSettings } from "../sheet-settings.ts"
import { WeightField } from "../item/fields/weight-field.ts"

class ContainedWeightReduction extends BaseFeature<ContainedWeightReductionSchema> {
	static override TYPE = feature.Type.ContainedWeightReduction

	static override defineSchema(): ContainedWeightReductionSchema {
		return {
			...super.defineSchema(),
			reduction: new WeightField({ required: true, nullable: false, initial: "0%", allowPercent: true }),
		}
	}

	get isPercentageReduction(): boolean {
		return this.reduction?.endsWith("%")
	}

	get percentageReduction(): number {
		if (!this.isPercentageReduction) return 0
		return Int.fromStringForced(this.reduction.substring(0, this.reduction.length - 1))
	}

	fixedReduction(defUnits: Weight.Unit): number {
		if (this.isPercentageReduction) return 0
		return Weight.fromString(this.reduction, defUnits)[0]
	}

	static extractContainedWeightReduction(s: string, defUnits: Weight.Unit): string {
		s = s.trim()
		if (s.endsWith("%")) {
			const v = Int.fromString(s.substring(0, s.length - 1).trim())
			return `${v.toString()}%`
		}
		const [w] = Weight.fromString(s, defUnits)
		return Weight.format(w)
	}

	override toFormElement(): HTMLElement {
		const element = document.createElement("li")
		const prefix = `system.features.${this.index}`

		const temporaryInput = this.schema.fields.type.toInput({
			name: `${prefix}.id`,
			value: this.type,
			readonly: true,
		}) as HTMLElement
		temporaryInput.style.setProperty("display", "none")
		element.append(temporaryInput)

		const rowElement = document.createElement("div")
		rowElement.classList.add("form-fields")

		rowElement.append(
			createButton({
				icon: ["fa-regular", "fa-trash"],
				label: "",
				data: {
					action: "deleteFeature",
					index: this.index.toString(),
				},
			}),
		)

		rowElement.append(
			foundry.applications.fields.createSelectInput({
				name: `${prefix}.type`,
				value: this.type,
				dataset: {
					selector: "feature-type",
					index: this.index.toString(),
				},
				localize: true,
				options: this._getTypeChoices(),
			}),
		)

		const settings = SheetSettings.for(this.parent.actor)
		rowElement.append(
			this.schema.fields.reduction.toInput({
				name: `${prefix}.reduction`,
				value: this.isPercentageReduction
					? this.reduction
					: Weight.format(
							Weight.fromStringForced(this.reduction, settings.default_weight_units),
							settings.default_weight_units,
						),
				localize: true,
			}) as HTMLElement,
		)

		element.append(rowElement)

		return element
	}

	fillWithNameableKeys(_m: Map<string, string>, _existing: Map<string, string>): void {}
}

interface ContainedWeightReduction
	extends BaseFeature<ContainedWeightReductionSchema>,
		ModelPropsFromSchema<ContainedWeightReductionSchema> {}

type ContainedWeightReductionSchema = BaseFeatureSchema & {
	reduction: WeightField<string, string, true, false, true>
}
export { ContainedWeightReduction, type ContainedWeightReductionSchema }
