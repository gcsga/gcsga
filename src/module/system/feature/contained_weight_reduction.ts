import { feature } from "@util/enum/feature.ts"
import { BonusOwner } from "./bonus_owner.ts"
import { Int } from "@util/fxp.ts"
import { Weight, WeightUnits } from "@util/weight.ts"
import { ContainedWeightReductionObj } from "./data.ts"

export class ContainedWeightReduction extends BonusOwner {
	override type = feature.Type.ContainedWeightReduction

	reduction: string

	effective: boolean = false

	constructor() {
		this.reduction = "0%"
	}

	get isPercentageReduction(): boolean {
		return this.reduction?.endsWith("%")
	}

	get percentageReduction(): number {
		if (!this.isPercentageReduction) return 0
		return Int.fromStringForced(this.reduction.substring(0, this.reduction.length - 1))
	}

	fixedReduction(defUnits: WeightUnits): number {
		if (this.isPercentageReduction) return 0
		return Weight.fromString(this.reduction, defUnits)
	}

	toObject(): ContainedWeightReductionObj {
		return {
			type: this.type,
			reduction: this.reduction,
		}
	}

	static fromObject(data: ContainedWeightReductionObj): ContainedWeightReduction {
		const bonus = new ContainedWeightReduction()
		bonus.reduction = data.reduction
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
