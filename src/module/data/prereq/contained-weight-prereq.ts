import { BasePrereq } from "./base.ts"
import { LocalizeGURPS, TooltipGURPS, Weight, prereq } from "@util"
import { ContainedWeightPrereqSchema, PrereqConstructionOptions } from "./data.ts"
import { ItemType, NumericCompareType } from "@module/data/constants.ts"
import { WeightCriteria } from "@module/util/weight-criteria.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { ActorGURPS2 } from "@module/document/actor.ts"
import { SheetSettings } from "../sheet-settings.ts"

class ContainedWeightPrereq extends BasePrereq<ContainedWeightPrereqSchema> {
	constructor(data: DeepPartial<SourceFromSchema<ContainedWeightPrereqSchema>>, options?: PrereqConstructionOptions) {
		super(data, options)
		this.qualifier = new WeightCriteria(data.qualifier)
	}

	static override defineSchema(): ContainedWeightPrereqSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({
				required: true,
				nullable: false,
				blank: false,
				initial: prereq.Type.ContainedWeight,
			}),
			has: new fields.BooleanField({ initial: true }),
			qualifier: new fields.SchemaField(WeightCriteria.defineSchema(), {
				initial: {
					compare: NumericCompareType.AtLeastNumber,
					qualifier: Weight.format(5, Weight.Unit.Pound),
				},
			}),
		}
	}

	satisfied(actor: ActorGURPS2, exclude: unknown, tooltip: TooltipGURPS): boolean {
		const units = SheetSettings.for(actor).default_weight_units
		let satisfied = false
		if (!(exclude instanceof ItemGURPS2) || !exclude.isOfType(ItemType.EquipmentContainer)) satisfied = true
		else {
			const eqp = exclude
			const weight = eqp.system.extendedWeight(false, units) - eqp.system.adjustedWeight(false, units)
			satisfied = this.qualifier.matches(weight)
		}
		if (!this.has) satisfied = !satisfied
		if (!satisfied) {
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.prefix)
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.has[this.has ? "true" : "false"])
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.contained_weight, {
					content: this.qualifier.describe(),
				}),
			)
		}
		return satisfied
	}

	fillWithNameableKeys(_m: Map<string, string>, _existing: Map<string, string>): void {}
}

interface ContainedWeightPrereq
	extends BasePrereq<ContainedWeightPrereqSchema>,
		Omit<ModelPropsFromSchema<ContainedWeightPrereqSchema>, "qualifier"> {
	qualifier: WeightCriteria
}

export { ContainedWeightPrereq }
