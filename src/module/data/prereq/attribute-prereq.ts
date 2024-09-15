import { BasePrereq } from "./base.ts"
import { prereq } from "@util/enum/prereq.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { ActorType, NumericCompareType, gid } from "@data"
import { TooltipGURPS } from "@util"
import { AttributePrereqSchema, PrereqConstructionOptions } from "./data.ts"
import { NumericCriteria } from "@module/util/index.ts"
import { ActorGURPS2 } from "@module/document/actor.ts"

class AttributePrereq extends BasePrereq<AttributePrereqSchema> {
	constructor(data: DeepPartial<SourceFromSchema<AttributePrereqSchema>>, options?: PrereqConstructionOptions) {
		super(data, options)
		this.qualifier = new NumericCriteria(data.qualifier)
	}

	static override defineSchema(): AttributePrereqSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({
				required: true,
				nullable: false,
				blank: false,
				initial: prereq.Type.Attribute,
			}),
			which: new fields.StringField({ initial: gid.Strength }),
			has: new fields.BooleanField({ initial: true }),
			combined_with: new fields.StringField({ initial: "" }),
			qualifier: new fields.SchemaField(NumericCriteria.defineSchema(), {
				initial: {
					compare: NumericCompareType.AtLeastNumber,
					qualifier: 10,
				},
			}),
		}
	}

	satisfied(actor: ActorGURPS2, _exclude: unknown, tooltip: TooltipGURPS): boolean {
		if (actor instanceof ActorGURPS2 && !actor.isOfType(ActorType.Character)) return true
		let value = actor.system.resolveAttributeCurrent(this.which)
		if (this.combined_with !== "") value += actor.system.resolveAttributeCurrent(this.combined_with)
		let satisfied = this.qualifier.matches(value)
		if (!this.has) satisfied = !satisfied
		if (!satisfied) {
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.prefix)
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.has[this.has ? "true" : "false"])
			tooltip.push(" ")
			tooltip.push(actor.system.resolveAttributeName(this.which))
			if (this.combined_with !== "") {
				tooltip.push("+")
				tooltip.push(actor.system.resolveAttributeName(this.combined_with))
			}
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.attribute.qualifier, {
					content: this.qualifier.describe(),
				}),
			)
		}
		return satisfied
	}

	fillWithNameableKeys(_m: Map<string, string>, _existing: Map<string, string>): void {}
}

interface AttributePrereq
	extends BasePrereq<AttributePrereqSchema>,
		Omit<ModelPropsFromSchema<AttributePrereqSchema>, "qualifier"> {
	qualifier: NumericCriteria
}
export { AttributePrereq }
