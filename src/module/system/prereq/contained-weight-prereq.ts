import { EquipmentContainerGURPS } from "@item"
import { BasePrereq } from "./base.ts"
import {
	EquipmentHolder,
	LocalizeGURPS,
	NumericCompareType,
	TooltipGURPS,
	Weight,
	WeightCriteria,
	WeightUnits,
	prereq,
} from "@util"
import { ContainedWeightPrereqObj } from "./data.ts"

export class ContainedWeightPrereq extends BasePrereq {
	qualifier: WeightCriteria

	constructor(character: EquipmentHolder | null) {
		let units = WeightUnits.Pound
		if (character) units = character.settings.default_weight_units
		super(prereq.Type.ContainedWeight)
		this.qualifier = new WeightCriteria({
			compare: NumericCompareType.AtMostNumber,
			qualifier: Weight.format(5, units),
		})
	}

	static fromObject(data: ContainedWeightPrereqObj, character: EquipmentHolder | null): ContainedWeightPrereq {
		const prereq = new ContainedWeightPrereq(character)
		if (data.qualifier) prereq.qualifier = new WeightCriteria(data.qualifier)
		return prereq
	}

	satisfied(actor: EquipmentHolder, exclude: EquipmentContainerGURPS, tooltip: TooltipGURPS): boolean {
		const units = actor.settings.default_weight_units
		let satisfied = false
		if (!(exclude instanceof EquipmentContainerGURPS)) satisfied = true
		else {
			const eqp = exclude as EquipmentContainerGURPS
			// @ts-expect-error awaiting implementation
			const weight = eqp.extendedWeight(false, units) - eqp.adjustedWeight(false, units)
			satisfied = this.qualifier.matches(Weight.format(weight, units))
		}
		if (!this.has) satisfied = !satisfied
		if (!satisfied) {
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.prefix)
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.has[this.has ? "true" : "false"])
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.contained_weight, {
					content: this.qualifier.describe(),
				}),
			)
		}
		return satisfied
	}
}
