import { LocalizeGURPS } from "../../util/localize.ts"
import { Weight, WeightString, WeightUnits } from "../../util/weight.ts"
import { AllNumericCompareTypes, NumericCompareType } from "@module/data/constants.ts"
import type { ItemGURPS } from "@item"
import type { WeightCriteriaSchema } from "./data.ts"

class WeightCriteria extends foundry.abstract.DataModel<ItemGURPS, WeightCriteriaSchema> {
	static override defineSchema(): WeightCriteriaSchema {
		const fields = foundry.data.fields
		return {
			compare: new fields.StringField<NumericCompareType, NumericCompareType, true>({
				required: true,
				choices: AllNumericCompareTypes,
				initial: NumericCompareType.AnyNumber,
			}),
			qualifier: new fields.StringField({
				initial: `0 ${WeightUnits.Pound}`,
			}),
		}
	}

	constructor(data?: DeepPartial<SourceFromSchema<WeightCriteriaSchema>>) {
		super(data)
	}

	matches(n: WeightString): boolean {
		const qualifier = Weight.fromString(this.qualifier)
		const value = Weight.fromString(n)
		switch (this.compare) {
			case NumericCompareType.AnyNumber:
				return true
			case NumericCompareType.EqualsNumber:
				return value === qualifier
			case NumericCompareType.NotEqualsNumber:
				return value !== qualifier
			case NumericCompareType.AtLeastNumber:
				return value >= qualifier
			case NumericCompareType.AtMostNumber:
				return value <= qualifier
		}
	}

	override toString(): string {
		return LocalizeGURPS.translations.gurps.numeric_criteria.string[this.compare]
	}

	altString(): string {
		return LocalizeGURPS.translations.gurps.numeric_criteria.alt_string[this.compare]
	}

	describe(): string {
		const result = this.toString()
		if (this.compare === NumericCompareType.AnyNumber) return result
		return `${result} ${this.qualifier}`
	}

	altDescribe(): string {
		let result = this.altString()
		if (this.compare === NumericCompareType.AnyNumber) return result
		if (result !== "") result += " "
		return result + this.qualifier.toString()
	}
}

interface WeightCriteria
	extends foundry.abstract.DataModel<ItemGURPS, WeightCriteriaSchema>,
		ModelPropsFromSchema<WeightCriteriaSchema> {}

export { WeightCriteria, type WeightCriteriaSchema }
