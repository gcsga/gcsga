import fields = foundry.data.fields
import { LocalizeGURPS, NumericComparison } from "@util"
import { ItemDataModel } from "@module/data/abstract.ts"

class NumericCriteria extends foundry.abstract.DataModel<ItemDataModel, NumericCriteriaSchema> {
	static override defineSchema(): NumericCriteriaSchema {
		const fields = foundry.data.fields
		return {
			compare: new fields.StringField({
				required: true,
				choices: NumericComparison.Options,
				initial: NumericComparison.Option.AnyNumber,
			}),
			qualifier: new fields.NumberField(),
		}
	}

	constructor(data?: DeepPartial<SourceFromSchema<NumericCriteriaSchema>>) {
		super(data)
	}

	matches(n: number): boolean {
		if (this.qualifier === null) this.qualifier = 0
		switch (this.compare) {
			case NumericComparison.Option.AnyNumber:
				return true
			case NumericComparison.Option.EqualsNumber:
				return n === this.qualifier
			case NumericComparison.Option.NotEqualsNumber:
				return n !== this.qualifier
			case NumericComparison.Option.AtLeastNumber:
				return n >= this.qualifier
			case NumericComparison.Option.AtMostNumber:
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
		if (this.compare === NumericComparison.Option.AnyNumber) return result
		return `${result} ${this.qualifier}`
	}

	altDescribe(): string {
		let result = this.altString()
		if (this.compare === NumericComparison.Option.AnyNumber) return result
		if (result !== "") result += " "
		return result + (this.qualifier ?? 0).toString()
	}
}

interface NumericCriteria
	extends foundry.abstract.DataModel<ItemDataModel, NumericCriteriaSchema>,
		ModelPropsFromSchema<NumericCriteriaSchema> {}

type NumericCriteriaSchema = {
	compare: fields.StringField<NumericComparison.Option, NumericComparison.Option, true, false, true>
	qualifier: fields.NumberField<number, number, true, false, true>
}

export { NumericCriteria, type NumericCriteriaSchema }
