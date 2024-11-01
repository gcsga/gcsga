import { prereq } from "@util/enum/prereq.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { BasePrereq, BasePrereqSchema } from "./base-prereq.ts"
import { NumericComparison, TooltipGURPS } from "@util"
import { ItemType } from "@module/data/constants.ts"
import { ItemGURPS2 } from "@module/documents/item.ts"
import { NumericCriteriaField } from "../item/fields/numeric-criteria-field.ts"
import { createButton, createDummyElement } from "@module/applications/helpers.ts"

class ContainedQuantityPrereq extends BasePrereq<ContainedQuantityPrereqSchema> {
	static override TYPE = prereq.Type.ContainedQuantity

	static override defineSchema(): ContainedQuantityPrereqSchema {
		return {
			...super.defineSchema(),
			qualifier: new NumericCriteriaField({
				required: true,
				nullable: false,
				choices: {
					[NumericComparison.Option.EqualsNumber]: game.i18n.localize(
						"GURPS.Item.Prereqs.FIELDS.Quantity.Equals",
					),
					[NumericComparison.Option.AtLeastNumber]: game.i18n.localize(
						"GURPS.Item.Prereqs.FIELDS.Quantity.AtLeast",
					),
					[NumericComparison.Option.AtMostNumber]: game.i18n.localize(
						"GURPS.Item.Prereqs.FIELDS.Quantity.AtMost",
					),
				},
				initial: {
					compare: NumericComparison.Option.AtMostNumber,
					qualifier: 1,
				},
			}),
		}
	}

	satisfied(_actor: unknown, exclude: unknown, tooltip: TooltipGURPS | null): boolean {
		let satisfied = false
		if (exclude instanceof ItemGURPS2 && exclude.isOfType(ItemType.EquipmentContainer)) {
			const children = exclude.system.children
			if (!(children instanceof Promise)) satisfied = this.qualifier.matches(children.size)
		}
		if (!this.has) satisfied = !satisfied
		if (!satisfied && tooltip !== null) {
			tooltip.push(LocalizeGURPS.translations.GURPS.Tooltip.Prefix)
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Prereq.ContainedQuantity, {
					has: this.hasText,
					qualifier: this.qualifier.toString(),
				}),
			)
		}
		return satisfied
	}

	override toFormElement(enabled: boolean): HTMLElement {
		const prefix = `system.prereqs.${this.index}`

		const element = document.createElement("li")
		// Root element
		element.classList.add("prereq")

		element.append(createDummyElement(`${prefix}.id`, this.id))
		if (!enabled) {
			element.append(createDummyElement(`${prefix}.qualifier.compare`, this.qualifier.compare))
			element.append(createDummyElement(`${prefix}.qualifier.qualifier`, this.qualifier.qualifier))
		}

		const rowElement = document.createElement("div")
		rowElement.classList.add("form-fields")

		rowElement.append(
			createButton({
				icon: ["fa-regular", "fa-trash"],
				label: "",
				data: {
					action: "deletePrereq",
					id: this.id,
				},
				disabled: !enabled,
			}),
		)

		rowElement.append(
			(this.schema.fields as any).has.toInput({
				name: `${prefix}.has`,
				value: (this as any).has,
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)
		const typeField = this.schema.fields.type
		;(typeField as any).choices = prereq.TypesWithoutListChoices

		rowElement.append(
			typeField.toInput({
				name: `${prefix}.type`,
				value: this.type,
				dataset: {
					selector: "prereq-type",
					index: this.index.toString(),
				},
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)

		rowElement.append(
			this.schema.fields.qualifier.fields.compare.toInput({
				name: `${prefix}.qualifier.compare`,
				value: this.qualifier.compare,
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)
		rowElement.append(
			this.schema.fields.qualifier.fields.qualifier.toInput({
				name: `${prefix}.qualifier.qualifier`,
				value: this.qualifier.qualifier.toString(),
				disabled: !enabled,
			}) as HTMLElement,
		)

		element.append(rowElement)

		return element
	}

	fillWithNameableKeys(_m: Map<string, string>, _existing: Map<string, string>): void {}
}

interface ContainedQuantityPrereq
	extends BasePrereq<ContainedQuantityPrereqSchema>,
		ModelPropsFromSchema<ContainedQuantityPrereqSchema> {}

type ContainedQuantityPrereqSchema = BasePrereqSchema & {
	qualifier: NumericCriteriaField<true, false, true>
}

export { ContainedQuantityPrereq, type ContainedQuantityPrereqSchema }
