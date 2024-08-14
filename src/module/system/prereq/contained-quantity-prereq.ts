import { ItemGURPS } from "@item"
import { prereq } from "@util/enum/prereq.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { BasePrereq } from "./base.ts"
import { ContainedQuantityPrereqSchema, PrereqConstructionOptions } from "./data.ts"
import { TooltipGURPS } from "@util"
import { ItemType, NumericCompareType } from "@module/data/constants.ts"
import { ActorGURPS } from "@actor"
import { NumericCriteria } from "@module/util/numeric-criteria.ts"

class ContainedQuantityPrereq extends BasePrereq<ContainedQuantityPrereqSchema> {
	constructor(
		data: DeepPartial<SourceFromSchema<ContainedQuantityPrereqSchema>>,
		options?: PrereqConstructionOptions,
	) {
		super(data, options)
		this.qualifier = new NumericCriteria(data.qualifier)
	}

	static override defineSchema(): ContainedQuantityPrereqSchema {
		const fields = foundry.data.fields

		return {
			type: new fields.StringField({ initial: prereq.Type.ContainedQuantity }),
			has: new fields.BooleanField({ initial: true }),
			qualifier: new fields.SchemaField(NumericCriteria.defineSchema(), {
				initial: {
					compare: NumericCompareType.AtLeastNumber,
					qualifier: 1,
				},
			}),
		}
	}

	satisfied(_actor: ActorGURPS, exclude: unknown, tooltip: TooltipGURPS): boolean {
		let satisfied = false
		if (exclude instanceof ItemGURPS && exclude.isOfType(ItemType.EquipmentContainer)) {
			satisfied = this.qualifier.matches(exclude.children.size)
		}
		if (!this.has) satisfied = !satisfied
		if (!satisfied) {
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.prefix)
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.has[this.has ? "true" : "false"])
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.contained_quantity, {
					content: this.qualifier.describe(),
				}),
			)
		}
		return satisfied
	}

	fillWithNameableKeys(_m: Map<string, string>, _existing: Map<string, string>): void {}
}

interface ContainedQuantityPrereq
	extends BasePrereq<ContainedQuantityPrereqSchema>,
		Omit<ModelPropsFromSchema<ContainedQuantityPrereqSchema>, "qualifier"> {
	qualifier: NumericCriteria
}
export { ContainedQuantityPrereq }
