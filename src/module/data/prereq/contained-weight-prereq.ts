import { BasePrereq, BasePrereqSchema } from "./base-prereq.ts"
import fields = foundry.data.fields
import { LocalizeGURPS, NumericComparison, TooltipGURPS, Weight, prereq } from "@util"
import { ActorType, ItemType } from "@module/data/constants.ts"
import { WeightCriteria } from "@module/util/weight-criteria.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { SheetSettings } from "../sheet-settings.ts"
import { ActorInst } from "../actor/helpers.ts"
import { BooleanSelectField } from "../item/fields/boolean-select-field.ts"

class ContainedWeightPrereq extends BasePrereq<ContainedWeightPrereqSchema> {
	static override TYPE = prereq.Type.ContainedWeight

	static override defineSchema(): ContainedWeightPrereqSchema {
		const fields = foundry.data.fields

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
			qualifier: new fields.EmbeddedDataField(WeightCriteria, {
				required: true,
				nullable: false,
				initial: {
					compare: NumericComparison.Option.AtLeastNumber,
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

	fillWithNameableKeys(_m: Map<string, string>, _existing: Map<string, string>): void {}
}

interface ContainedWeightPrereq
	extends BasePrereq<ContainedWeightPrereqSchema>,
		ModelPropsFromSchema<ContainedWeightPrereqSchema> {}

type ContainedWeightPrereqSchema = BasePrereqSchema & {
	has: BooleanSelectField<boolean, boolean, true, false, true>
	qualifier: fields.EmbeddedDataField<WeightCriteria, true, false, true>
}

export { ContainedWeightPrereq, type ContainedWeightPrereqSchema }
