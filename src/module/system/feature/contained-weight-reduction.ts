import { feature } from "@util/enum/feature.ts"
import { Int } from "@util/fxp.ts"
import { Weight, WeightUnits } from "@util/weight.ts"
import { ContainedWeightReductionObj } from "./data.ts"
import { FeatureOwner } from "@util"

export class ContainedWeightReduction {
	declare type: feature.Type.ContainedWeightReduction

	private _owner: FeatureOwner | null = null

	private _subOwner: FeatureOwner | null = null

	reduction: string

	effective: boolean = false

	get owner(): FeatureOwner | null {
		return this._owner
	}

	set owner(owner: FeatureOwner | null) {
		this._owner = owner
	}

	get subOwner(): FeatureOwner | null {
		return this._subOwner
	}

	set subOwner(subOwner: FeatureOwner | null) {
		this._subOwner = subOwner
	}

	setLevel(_level: number): void {}

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
			type: feature.Type.ContainedWeightReduction,
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
