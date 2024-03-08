import { NumericCompareType, NumericCriteria } from "@util/numeric-criteria.ts"
import { BasePrereq } from "./base.ts"
import { prereq } from "@util/enum/prereq.ts"
import { AttributePrereqObj } from "./data.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { gid } from "@data"
import { PrereqResolver, TooltipGURPS } from "@util"
import { LootGURPS } from "@actor"

export class AttributePrereq extends BasePrereq<prereq.Type.Attribute> {
	which: string

	combined_with: string

	qualifier: NumericCriteria

	constructor() {
		super(prereq.Type.Attribute)
		this.which = gid.Strength
		this.combined_with = ""
		this.qualifier = new NumericCriteria({ compare: NumericCompareType.AtLeastNumber, qualifier: 10 })
	}

	static fromObject(data: AttributePrereqObj): AttributePrereq {
		const prereq = new AttributePrereq()
		prereq.has = data.has
		if (data.which) prereq.which = data.which
		if (data.combined_with) prereq.combined_with = data.combined_with
		if (data.qualifier) prereq.qualifier = new NumericCriteria(data.qualifier)
		return prereq
	}

	satisfied(actor: PrereqResolver, _exclude: unknown, tooltip: TooltipGURPS): boolean {
		if (actor instanceof LootGURPS) return true
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

	override toObject(): AttributePrereqObj {
		return {
			...super.toObject(),
			has: this.has,
			which: this.which,
			combined_with: this.combined_with,
			qualifier: this.qualifier.toObject(),
		}
	}
}
