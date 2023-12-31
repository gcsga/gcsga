import { ItemType, NumericComparisonType, NumericCriteria, PrereqType } from "@module/data"
import { TooltipGURPS } from "@module/tooltip"
import { LocalizeGURPS, numberCompare } from "@util"
import { BasePrereq, PrereqConstructionContext } from "./base"

export class ContainedQuantityPrereq extends BasePrereq {
	qualifier!: NumericCriteria

	constructor(data: ContainedQuantityPrereq | any, context: PrereqConstructionContext = {}) {
		data = mergeObject(ContainedQuantityPrereq.defaults, data)
		super(data, context)
	}

	static get defaults(): Record<string, any> {
		return mergeObject(super.defaults, {
			type: PrereqType.ContainedQuantity,
			qualifier: { compare: NumericComparisonType.AtMostNumber, qualifier: 1 },
		})
	}

	satisfied(_actor: Actor, exclude: any, tooltip: TooltipGURPS): [boolean, boolean] {
		let satisfied = false
		if (exclude) {
			satisfied = exclude.type !== ItemType.EquipmentContainer
			if (!satisfied) {
				let quantity = 0
				for (const ch of exclude.children) {
					quantity += ch.system.quantity
				}
				satisfied = numberCompare(quantity, this.qualifier)
			}
		}
		if (!this.has) satisfied = !satisfied
		if (!satisfied) {
			tooltip.push(LocalizeGURPS.translations.gurps.prereqs.has[this.has ? "true" : "false"])
			tooltip.push(LocalizeGURPS.translations.gurps.prereqs.quantity)
			tooltip.push(LocalizeGURPS.translations.gurps.prereqs.criteria[this.qualifier?.compare])
			tooltip.push((this.qualifier.qualifier ?? 0).toString())
		}
		return [satisfied, false]
	}
}
