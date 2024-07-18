import type { NumberField, StringField } from "types/foundry/common/data/fields.js"
import { LocalizeGURPS } from "./localize.ts"
import { AllNumericCompareTypes, NumericCompareType } from "@module/data/constants.ts"
import { ItemGURPS } from "@item"

type NumericCriteriaSchema = {
	compare: StringField<NumericCompareType, NumericCompareType, true, false, true>
	qualifier: NumberField<number, number, true, false, true>
}

class NumericCriteria extends foundry.abstract.DataModel<ItemGURPS, NumericCriteriaSchema> {

	static override defineSchema(): NumericCriteriaSchema {
		const fields = foundry.data.fields
		return {
			compare: new fields.StringField<NumericCompareType, NumericCompareType, true>({
				required: true,
				choices: AllNumericCompareTypes,
				initial: NumericCompareType.AnyNumber,
			}),
			qualifier: new fields.NumberField(),
		}
	}

	constructor(data?: DeepPartial<SourceFromSchema<NumericCriteriaSchema>>) {
		super(data)
	}

	matches(n: number): boolean {
		switch (this.compare) {
			case NumericCompareType.AnyNumber:
				return true
			case NumericCompareType.EqualsNumber:
				return n === this.qualifier
			case NumericCompareType.NotEqualsNumber:
				return n !== this.qualifier
			case NumericCompareType.AtLeastNumber:
				return n >= this.qualifier
			case NumericCompareType.AtMostNumber:
				return n <= this.qualifier
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

interface NumericCriteria extends foundry.abstract.DataModel<ItemGURPS, NumericCriteriaSchema>, ModelPropsFromSchema<NumericCriteriaSchema> { }

export { NumericCriteria, type NumericCriteriaSchema }
