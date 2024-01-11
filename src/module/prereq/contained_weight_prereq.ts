import { WeightCriteria } from "@util/weight_criteria";
import { BasePrereq, BasePrereqObj } from "./base";
import { prereq } from "@util/enum";
import { CharacterResolver, EquipmentContainerResolver, LocalizeGURPS, NumericCompareType, Weight } from "@util";
import { TooltipGURPS } from "@module/tooltip";
import { ItemType } from "@module/data";

export interface ContainedWeightPrereqObj extends BasePrereqObj {
	qualifier: WeightCriteria
}

export class ContainedWeightPrereq extends BasePrereq {
	qualifier: WeightCriteria

	constructor(character: CharacterResolver) {
		super(prereq.Type.ContainedWeight)
		this.qualifier = new WeightCriteria(NumericCompareType.AtMostNumber, Weight.toPounds(5, character.settings.default_weight_units))
	}

	static fromObject(data: ContainedWeightPrereqObj, character: CharacterResolver): ContainedWeightPrereq {
		const prereq = new ContainedWeightPrereq(character)
		if (data.qualifier)
			prereq.qualifier = new WeightCriteria(data.qualifier.compare, data.qualifier.qualifier)
		return prereq
	}

	satisfied(character: CharacterResolver, exclude: any, tooltip: TooltipGURPS): boolean {
		const units = character.settings.default_weight_units
		let satisfied = false
		if (!(exclude instanceof Item && exclude.type === ItemType.EquipmentContainer)) satisfied = true
		else {
			const eqp = exclude as unknown as EquipmentContainerResolver
			const weight = eqp.extendedWeight(false, units) - eqp.adjustedWeight(false, units)
			satisfied = this.qualifier.matches(weight)
		}
		if (!this.has) satisfied = !satisfied
		if (!satisfied) {
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.prefix)
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.has[this.has ? "true" : "false"])
			tooltip.push(
				LocalizeGURPS.format(
					LocalizeGURPS.translations.gurps.prereq.contained_weight,
					{ content: this.qualifier.describe() }
				)

			)
		}
		return satisfied
	}
}
