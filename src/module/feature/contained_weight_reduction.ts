import { Weight, WeightUnits } from "@util"
import { BonusOwner } from "./bonus_owner"
import { FeatureType } from "./data"
import { Int } from "@util/fxp"

export interface ContainedWeightReductionObj {
	reduction: string
}

export class ContainedWeightReduction extends BonusOwner {
	type = FeatureType.ContainedWeightReduction

	reduction: string

	constructor() {
		super()
		this.reduction = "0%"
	}

	get isPercentageReduction(): boolean {
		return this.reduction.endsWith("%")
	}

	get percentageReduction(): number {
		if (!this.isPercentageReduction) return 0
		return Int.fromStringForced(this.reduction.substring(0, this.reduction.length - 1))
	}

	fixedReduction(defUnits: WeightUnits): number {
		if (this.isPercentageReduction) return 0
		return Weight.fromString(this.reduction, defUnits)
	}

	static fromObject(data: ContainedWeightReductionObj): ContainedWeightReduction {
		const bonus = new ContainedWeightReduction()
		for (const key of Object.keys(data)) {
			;(bonus as any)[key] = data[key as keyof ContainedWeightReductionObj]
		}
		return bonus
	}
}

export function extractContainedWeightReduction(s: string, defUnits: WeightUnits): string {
	s = s.trim()
	if (s.endsWith("%")) {
		const v = Int.fromString(s.substring(0, s.length - 1).trim())
		return `${v.toString()}%`
	}
	const w = Weight.fromString(s, defUnits)
	return Weight.format(w)
}
