import { NumericCompareType, NumericCriteria } from "@util/numeric_criteria.ts"
import { BasePrereq } from "./base.ts"
import { prereq } from "@util/enum/prereq.ts"
import { ContainedQuantityPrereqObj } from "./data.ts"
import { CharacterResolver, EquipmentContainerResolver, LocalizeGURPS, LootResolver } from "@util/index.ts"
import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { EquipmentContainerGURPS } from "@item"

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

	satisfied(
		_actor: CharacterResolver | LootResolver,
		exclude: EquipmentContainerGURPS,
		tooltip: TooltipGURPS,
	): boolean {
		let satisfied = false
		if (exclude instanceof EquipmentContainerGURPS) {
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
				}),
			)
		}
		return satisfied
	}
}
