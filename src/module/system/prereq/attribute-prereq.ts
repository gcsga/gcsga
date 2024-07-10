import { NumericCompareType, NumericCriteria } from "@util/numeric-criteria.ts"
import { BasePrereq } from "./base.ts"
import { prereq } from "@util/enum/prereq.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { ActorType, gid } from "@data"
import { TooltipGURPS } from "@util"
import { ActorGURPS } from "@actor"
import { AttributePrereqSchema } from "./data.ts"

class AttributePrereq extends BasePrereq<AttributePrereqSchema> {

	constructor(data: DeepPartial<SourceFromSchema<AttributePrereqSchema>>) {
		super(data)
		if (data.qualifier)
			this.qualifier = new NumericCriteria(data.qualifier)
	}

	static override defineSchema(): AttributePrereqSchema {
		const fields = foundry.data.fields

		return {
			type: new fields.StringField({ initial: prereq.Type.Attribute }),
			which: new fields.StringField({ initial: gid.Strength }),
			has: new fields.BooleanField({ initial: true }),
			combined_with: new fields.StringField({ initial: "" }),
			qualifier: new fields.SchemaField(NumericCriteria.defineSchema(), {
				initial: {
					compare: NumericCompareType.AtLeastNumber,
					qualifier: 10
				}
			})
		}
	}

	satisfied(actor: ActorGURPS, _exclude: unknown, tooltip: TooltipGURPS): boolean {
		if (actor instanceof ActorGURPS && actor.isOfType(ActorType.Loot)) return true
		let value = actor.resolveAttributeCurrent(this.which)
		if (this.combined_with !== "") value += actor.resolveAttributeCurrent(this.combined_with)
		let satisfied = this.qualifier.matches(value)
		if (!this.has) satisfied = !satisfied
		if (!satisfied) {
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.prefix)
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.has[this.has ? "true" : "false"])
			tooltip.push(" ")
			tooltip.push(actor.resolveAttributeName(this.which))
			if (this.combined_with !== "") {
				tooltip.push("+")
				tooltip.push(actor.resolveAttributeName(this.combined_with))
			}
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.attribute.qualifier, {
					content: this.qualifier.describe(),
				}),
			)
		}
		return satisfied
	}
}

interface AttributePrereq extends BasePrereq<AttributePrereqSchema>, Omit<ModelPropsFromSchema<AttributePrereqSchema>, "qualifier"> {
	qualifier: NumericCriteria
}

export { AttributePrereq }
