import { Weight, WeightUnits, fxp } from "@util"
import { BaseFeature } from "./base"
import { FeatureType } from "./data"

export class ContainedWeightReduction extends BaseFeature {
	reduction!: string

	static get defaults(): Record<string, any> {
		return mergeObject(super.defaults, {
			type: FeatureType.ContaiedWeightReduction,
			reduction: "0%",
		})
	}

	get isPercentageReduction(): boolean {
		return this.reduction.endsWith("%")
	}

	get percentageReduction(): number {
		if (!this.isPercentageReduction) return 0
		return fxp.Int.fromStringForced(this.reduction.substring(0, this.reduction.length - 1))
	}

	fixedReduction(defUnits: WeightUnits): number {
		if (this.isPercentageReduction) return 0
		return Weight.fromString(this.reduction, defUnits)
	}
}
