import { prereq } from "@util/enum/prereq.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { BasePrereq, BasePrereqSchema } from "./base-prereq.ts"
import { NumericComparison, TooltipGURPS } from "@util"
import { ItemType } from "@module/data/constants.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { NumericCriteriaField } from "../item/fields/numeric-criteria-field.ts"
import { BooleanSelectField } from "../item/fields/boolean-select-field.ts"

class ContainedQuantityPrereq extends BasePrereq<ContainedQuantityPrereqSchema> {
	static override TYPE = prereq.Type.ContainedQuantity

	static override defineSchema(): ContainedQuantityPrereqSchema {
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
			qualifier: new NumericCriteriaField({
				required: true,
				nullable: false,
				initial: {
					compare: NumericComparison.Option.AtLeastNumber,
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

	fillWithNameableKeys(_m: Map<string, string>, _existing: Map<string, string>): void {}
}

interface ContainedQuantityPrereq
	extends BasePrereq<ContainedQuantityPrereqSchema>,
		ModelPropsFromSchema<ContainedQuantityPrereqSchema> {}

type ContainedQuantityPrereqSchema = BasePrereqSchema & {
	has: BooleanSelectField<boolean, boolean, true, false, true>
	qualifier: NumericCriteriaField<true, false, true>
}

export { ContainedQuantityPrereq, type ContainedQuantityPrereqSchema }
