import fields = foundry.data.fields
import { BaseFeature, BaseFeatureSchema } from "./base-feature.ts"
import { Int, Weight, feature } from "@util"

class ContainedWeightReduction extends BaseFeature<ContainedWeightReductionSchema> {
	static override TYPE = feature.Type.ContainedWeightReduction

	static override defineSchema(): ContainedWeightReductionSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
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

	fixedReduction(defUnits: Weight.Unit): number {
		if (this.isPercentageReduction) return 0
		return Weight.fromString(this.reduction, defUnits)[0]
	}

	static extractContainedWeightReduction(s: string, defUnits: Weight.Unit): string {
		s = s.trim()
		if (s.endsWith("%")) {
			const v = Int.fromString(s.substring(0, s.length - 1).trim())
			return `${v.toString()}%`
		}
		const [w] = Weight.fromString(s, defUnits)
		return Weight.format(w)
	}

	fillWithNameableKeys(_m: Map<string, string>, _existing: Map<string, string>): void {}
}

interface ContainedWeightReduction
	extends BaseFeature<ContainedWeightReductionSchema>,
		ModelPropsFromSchema<ContainedWeightReductionSchema> {}

type ContainedWeightReductionSchema = BaseFeatureSchema & {
	reduction: fields.StringField<string, string, true, false, true>
}
export { ContainedWeightReduction, type ContainedWeightReductionSchema }
