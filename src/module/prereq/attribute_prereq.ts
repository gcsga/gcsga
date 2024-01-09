import { LocalizeGURPS, NumericCompareType, NumericCriteria } from "@util"
import { BasePrereq, BasePrereqObj } from "./base"
import { prereq } from "@util/enum"
import { gid } from "@module/data"
import { CharacterGURPS } from "@actor"
import { TooltipGURPS } from "@module/tooltip"

export interface AttributePrereqObj extends BasePrereqObj {
	which: string
	combined_with: string
	qualifier: NumericCriteria
}

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
		if (data.which)
			prereq.which = data.which
		if (data.combined_with)
			prereq.combined_with = data.combined_with
		if (data.qualifier)
			prereq.qualifier = new NumericCriteria(data.qualifier.compare, data.qualifier.qualifier)
		return prereq
	}

	satisfied(character: CharacterGURPS, _exclude: any, tooltip: TooltipGURPS): boolean {
		let value = character.resolveAttributeCurrent(this.which)
		if (this.combined_with !== "")
			value += character.resolveAttributeCurrent(this.combined_with)
		let satisfied = this.qualifier.matches(value)
		if (!this.has) satisfied = !satisfied
		if (!satisfied) {
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.prefix)
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.has[this.has ? "true" : "false"])
			tooltip.push(" ")
			tooltip.push(character.resolveAttributeName(this.which))
			if (this.combined_with !== "") {
				tooltip.push("+")
				tooltip.push(character.resolveAttributeName(this.combined_with))
			}
			tooltip.push(
				LocalizeGURPS.format(
					LocalizeGURPS.translations.gurps.prereq.attribute.qualifier, { content: this.qualifier.describe() }
				))
		}
		return satisfied
	}
}
