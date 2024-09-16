import { prereq } from "@util/enum/prereq.ts"
import fields = foundry.data.fields
import { LocalizeGURPS } from "@util/localize.ts"
import { BasePrereq, BasePrereqSchema } from "./base-prereq.ts"
import { TooltipGURPS } from "@util"
import { ItemType, NumericCompareType } from "@module/data/constants.ts"
import { NumericCriteria, NumericCriteriaSchema } from "@module/util/numeric-criteria.ts"
import { ItemGURPS2 } from "@module/document/item.ts"

class ContainedQuantityPrereq extends BasePrereq<ContainedQuantityPrereqSchema> {
	static override TYPE = prereq.Type.ContainedQuantity

	static override defineSchema(): ContainedQuantityPrereqSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			has: new fields.BooleanField({ initial: true }),
			qualifier: new fields.SchemaField(NumericCriteria.defineSchema(), {
				initial: {
					compare: NumericCompareType.AtLeastNumber,
					qualifier: 1,
				},
			}),
		}
	}

	satisfied(_actor: unknown, exclude: unknown, tooltip: TooltipGURPS): boolean {
		let satisfied = false
		if (exclude instanceof ItemGURPS2 && exclude.isOfType(ItemType.EquipmentContainer)) {
			const children = exclude.system.children
			if (!(children instanceof Promise)) satisfied = this.qualifier.matches(children.size)
		}
		if (!this.has) satisfied = !satisfied
		if (!satisfied) {
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
	has: fields.BooleanField<boolean, boolean, true, false, true>
	qualifier: fields.SchemaField<NumericCriteriaSchema, SourceFromSchema<NumericCriteriaSchema>, NumericCriteria>
}

export { ContainedQuantityPrereq, type ContainedQuantityPrereqSchema }
