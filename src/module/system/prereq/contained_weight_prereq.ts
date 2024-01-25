import { WeightCriteria } from "@util/weight_criteria.ts"
import { BasePrereq } from "./base.ts"
import {
	CharacterResolver,
	EquipmentContainerResolver,
	LocalizeGURPS,
	LootResolver,
	NumericCompareType,
	Weight,
	WeightUnits,
} from "@util/index.ts"
import { prereq } from "@util/enum/prereq.ts"
import { ContainedWeightPrereqObj } from "./data.ts"
import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { ItemType } from "@module/data/misc.ts"

export class ContainedWeightPrereq extends BasePrereq {
	qualifier: WeightCriteria

	constructor(character?: CharacterResolver) {
		let units = WeightUnits.Pound
		if (character) units = character.settings.default_weight_units
		super(prereq.Type.ContainedWeight)
		this.qualifier = new WeightCriteria(NumericCompareType.AtMostNumber, Weight.toPounds(5, units))
	}

	static fromObject(data: ContainedWeightPrereqObj, character: CharacterResolver): ContainedWeightPrereq {
		const prereq = new ContainedWeightPrereq(character)
		if (data.qualifier) prereq.qualifier = new WeightCriteria(data.qualifier.compare, data.qualifier.qualifier)
		return prereq
	}

	satisfied(actor: CharacterResolver | LootResolver, exclude: any, tooltip: TooltipGURPS): boolean {
		const units = actor.settings.default_weight_units
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
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.contained_weight, {
					content: this.qualifier.describe(),
				}),
			)
		}
		return satisfied
	}
}
