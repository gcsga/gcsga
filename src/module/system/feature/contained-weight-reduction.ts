import { Int } from "@util/fxp.ts"
import { Weight, WeightUnits } from "@util/weight.ts"
import { ContainedWeightReductionSchema } from "./data.ts"
import { BaseFeature } from "./base.ts"

class ContainedWeightReduction extends BaseFeature<ContainedWeightReductionSchema> {
	static override defineSchema(): ContainedWeightReductionSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			// TODO: change for maybe percentage maybe number value (regex?)
			reduction: new fields.StringField({ initial: "0%" }),
		}
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

	static extractContainedWeightReduction(s: string, defUnits: WeightUnits): string {
		s = s.trim()
		if (s.endsWith("%")) {
			const v = Int.fromString(s.substring(0, s.length - 1).trim())
			return `${v.toString()}%`
		}
		const w = Weight.fromString(s, defUnits)
		return Weight.format(w)
	}
}

interface ContainedWeightReduction
	extends BaseFeature<ContainedWeightReductionSchema>,
		ModelPropsFromSchema<ContainedWeightReductionSchema> {}

export { ContainedWeightReduction }
