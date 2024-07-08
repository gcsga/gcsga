import { StringField } from "types/foundry/common/data/fields.js"
import { LocalizeGURPS } from "./localize.ts"
import { NumericCompareType } from "./numeric-criteria.ts"
import { Weight, WeightString, WeightUnits } from "./weight.ts"

export type WeightCriteriaSchema = {
	compare: StringField<NumericCompareType, NumericCompareType, true, false, true>
	qualifier: StringField<WeightString, WeightString, true, false, true>
}

export class WeightCriteria {
	declare compare: NumericCompareType
	declare qualifier: WeightString

	constructor(data: SourceFromSchema<WeightCriteriaSchema>) {
		this.compare = data.compare ?? NumericCompareType.AnyNumber
		this.qualifier = data.qualifier ?? `0 ${WeightUnits.Pound}`
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

	toString(): string {
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

	toObject(): SourceFromSchema<WeightCriteriaSchema> {
		return { compare: this.compare, qualifier: this.qualifier }
	}
}
