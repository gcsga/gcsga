import { ItemGURPS } from "@item"
import { BasePrereq } from "./base.ts"
import { LocalizeGURPS, NumericCompareType, TooltipGURPS, Weight, WeightCriteria, WeightUnits, prereq } from "@util"
import { ContainedWeightPrereqObj } from "./data.ts"
import { ItemType } from "@module/data/constants.ts"
import { EquipmentHolder } from "@module/util/index.ts"

export class ContainedWeightPrereq extends BasePrereq<prereq.Type.ContainedWeight> {
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

	satisfied(actor: EquipmentHolder, exclude: unknown, tooltip: TooltipGURPS): boolean {
		const units = actor.settings.default_weight_units
		let satisfied = false
		if (!(exclude instanceof ItemGURPS) || !exclude.isOfType(ItemType.EquipmentContainer)) satisfied = true
		else {
			const eqp = exclude
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

	override toObject(): ContainedWeightPrereqObj {
		return {
			...super.toObject(),
			has: this.has,
			qualifier: this.qualifier.toObject(),
		}
	}
}
