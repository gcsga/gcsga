import { ActorResolver, EquipmentContainerResolver, LocalizeGURPS, NumericCompareType, NumericCriteria } from "@util"
import { BasePrereq, BasePrereqObj } from "./base"
import { prereq } from "@util/enum"
import { TooltipGURPS } from "@module/tooltip"
import { ItemType } from "@module/data"

export interface ContainedQuantityPrereqObj extends BasePrereqObj {
	qualifier: NumericCriteria
}

export class ContainedQuantityPrereq extends BasePrereq {
	qualifier: NumericCriteria

	constructor() {
		super(prereq.Type.ContainedQuantity)
		this.qualifier = new NumericCriteria(NumericCompareType.AtMostNumber, 1)
	}

	static fromObject(data: ContainedQuantityPrereqObj): ContainedQuantityPrereq {
		const prereq = new ContainedQuantityPrereq()
		prereq.has = data.has
		if (data.qualifier) prereq.qualifier = new NumericCriteria(data.qualifier.compare, data.qualifier.qualifier)
		return prereq
	}

	satisfied(_actor: ActorResolver<any>, exclude: any, tooltip: TooltipGURPS): boolean {
		let satisfied = false
		if (exclude instanceof Item && exclude.type === ItemType.EquipmentContainer) {
			const eqp = exclude as unknown as EquipmentContainerResolver
			satisfied = this.qualifier.matches(eqp.children.size)
		}
		if (!this.has) satisfied = !satisfied
		if (!satisfied) {
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.prefix)
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.has[this.has ? "true" : "false"])
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.contained_quantity, {
					content: this.qualifier.describe(),
				})
			)
		}
		return satisfied
	}
}
