import { ItemGURPS } from "@item"
import { prereq } from "@util/enum/prereq.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { NumericCompareType, NumericCriteria } from "@util/numeric-criteria.ts"
import { BasePrereq } from "./base.ts"
import { ContainedQuantityPrereqObj } from "./data.ts"
import { TooltipGURPS } from "@util"
import { ItemType } from "@module/data/constants.ts"
import { PrereqResolver } from "@module/util/index.ts"

export class ContainedQuantityPrereq extends BasePrereq<prereq.Type.ContainedQuantity> {
	qualifier: NumericCriteria

	constructor() {
		super(prereq.Type.ContainedQuantity)
		this.qualifier = new NumericCriteria({ compare: NumericCompareType.AtMostNumber, qualifier: 1 })
	}

	static fromObject(data: ContainedQuantityPrereqObj): ContainedQuantityPrereq {
		const prereq = new ContainedQuantityPrereq()
		prereq.has = data.has
		if (data.qualifier) prereq.qualifier = new NumericCriteria(data.qualifier)
		return prereq
	}

	satisfied(_actor: PrereqResolver, exclude: unknown, tooltip: TooltipGURPS): boolean {
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

	override toObject(): ContainedQuantityPrereqObj {
		return {
			...super.toObject(),
			has: this.has,
			qualifier: this.qualifier.toObject(),
		}
	}
}
