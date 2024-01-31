import { NumericCompareType, NumericCriteria } from "@util/numeric_criteria.ts"
import { BasePrereq } from "./base.ts"
import { prereq } from "@util/enum/prereq.ts"
import { AttributePrereqObj } from "./data.ts"
import { CharacterResolver, LootResolver } from "@util/resolvers.ts"
import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { gid } from "@module/data/misc.ts"
import { Attribute } from "@sytem/attribute/index.ts"
import { ActorType } from "@actor"

export class AttributePrereq extends BasePrereq {
	which: string

	combined_with: string

	qualifier: NumericCriteria

	constructor() {
		super(prereq.Type.Attribute)
		this.which = gid.Strength
		this.combined_with = ""
		this.qualifier = new NumericCriteria(NumericCompareType.AtLeastNumber, 10)
	}

	static fromObject(data: AttributePrereqObj): AttributePrereq {
		const prereq = new AttributePrereq()
		prereq.has = data.has
		if (data.which) prereq.which = data.which
		if (data.combined_with) prereq.combined_with = data.combined_with
		if (data.qualifier) prereq.qualifier = new NumericCriteria(data.qualifier.compare, data.qualifier.qualifier)
		return prereq
	}

	satisfied(actor: CharacterResolver | LootResolver, _exclude: Attribute, tooltip: TooltipGURPS): boolean {
		if (actor.type === ActorType.Loot) return true
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
