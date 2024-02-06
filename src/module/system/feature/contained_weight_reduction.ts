import { feature } from "@util/enum/feature.ts"
import { Int } from "@util/fxp.ts"
import { Weight, WeightUnits } from "@util/weight.ts"
import { ContainedWeightReductionObj } from "./data.ts"
import { Stringer } from "@data"

export class ContainedWeightReduction {
	declare type: feature.Type.ContainedWeightReduction

	private _owner?: Stringer

	private _subOwner?: Stringer

	reduction: string

	effective: boolean = false

	get owner(): Stringer | undefined {
		return this._owner
	}

	set owner(owner: Stringer | undefined) {
		this._owner = owner
	}

	get subOwner(): Stringer | undefined {
		return this._subOwner
	}

	set subOwner(subOwner: Stringer | undefined) {
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
