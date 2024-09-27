import { BasePrereq, BasePrereqSchema } from "./base-prereq.ts"
import { LocalizeGURPS, NumericComparison, TooltipGURPS, Weight, prereq } from "@util"
import { ActorType, ItemType } from "@module/data/constants.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { SheetSettings } from "../sheet-settings.ts"
import { ActorInst } from "../actor/helpers.ts"
import { BooleanSelectField } from "../item/fields/boolean-select-field.ts"
import { WeightCriteriaField } from "../item/fields/weight-criteria-field.ts"

class ContainedWeightPrereq extends BasePrereq<ContainedWeightPrereqSchema> {
	static override TYPE = prereq.Type.ContainedWeight

	static override defineSchema(): ContainedWeightPrereqSchema {
		return {
			...super.defineSchema(),
			has: new BooleanSelectField({
				required: true,
				nullable: false,
				choices: {
					true: "GURPS.Item.Prereqs.FIELDS.Has.Choices.true",
					false: "GURPS.Item.Prereqs.FIELDS.Has.Choices.false",
				},
				initial: true,
			}),
			qualifier: new WeightCriteriaField({
				required: true,
				nullable: false,
				choices: NumericComparison.CustomOptionsChoices("GURPS.Item.Prereqs.FIELDS.ContainedWeight.Qualifier"),
				initial: {
					compare: NumericComparison.Option.AtMostNumber,
					qualifier: Weight.format(5, Weight.Unit.Pound),
				},
			}),
		}
	}

	satisfied(actor: ActorInst<ActorType.Character>, exclude: unknown, tooltip: TooltipGURPS | null): boolean {
		let satisfied = false

		if (exclude instanceof ItemGURPS2 && exclude.isOfType(ItemType.EquipmentContainer)) {
			const units = SheetSettings.for(actor).default_weight_units
			const weight = exclude.system.extendedWeight(false, units) - exclude.system.adjustedWeight(false, units)
			satisfied = this.qualifier.matches(weight)
		}
		if (!this.has) satisfied = !satisfied
		if (!satisfied && tooltip !== null) {
			tooltip.push(LocalizeGURPS.translations.GURPS.Tooltip.Prefix)
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Prereq.ContainedWeight, {
					has: this.hasText,
					qualifier: this.qualifier.toString(),
				}),
			)
		}
		return satisfied
	}

	override toFormElement(): HTMLElement {
		const prefix = `system.prereqs.${this.index}`

		// Root element
		const element = super.toFormElement()

		// Name
		const rowElement = document.createElement("div")
		rowElement.classList.add("form-fields")
		rowElement.append(
			this.schema.fields.qualifier.fields.compare.toInput({
				name: `${prefix}.qualifier.compare`,
				value: this.qualifier.compare,
				localize: true,
			}) as HTMLElement,
		)
		rowElement.append(
			this.schema.fields.qualifier.fields.qualifier.toInput({
				name: `${prefix}.qualifier.qualifier`,
				value: this.qualifier.qualifier,
			}) as HTMLElement,
		)
		element.append(rowElement)

		return element
	}

	fillWithNameableKeys(_m: Map<string, string>, _existing: Map<string, string>): void {}
}

interface ContainedWeightPrereq
	extends BasePrereq<ContainedWeightPrereqSchema>,
		ModelPropsFromSchema<ContainedWeightPrereqSchema> {}

type ContainedWeightPrereqSchema = BasePrereqSchema & {
	has: BooleanSelectField<boolean, boolean, true, false, true>
	qualifier: WeightCriteriaField<true, false, true>
}

export { ContainedWeightPrereq, type ContainedWeightPrereqSchema }
