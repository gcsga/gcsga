import { Weight, WeightUnits } from "@util"
import { Int } from "@util/fxp"
import { feature } from "@util/enum"

export interface ContainedWeightReductionObj {
	type: feature.Type
	reduction: string
}

export class ContainedWeightReduction {
	type = feature.Type.ContainedWeightReduction

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
