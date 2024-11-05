import { ItemDataModel } from "@module/data/item/abstract.ts"
import { NumericComparison, Weight } from "@util"
import fields = foundry.data.fields

class WeightCriteria extends foundry.abstract.DataModel<ItemDataModel, WeightCriteriaSchema> {
	static override defineSchema(): WeightCriteriaSchema {
		const fields = foundry.data.fields
		return {
			compare: new fields.StringField({
				required: true,
				nullable: false,
				choices: NumericComparison.Options,
				initial: NumericComparison.Option.AnyNumber,
			}),
			qualifier: new fields.StringField({
				initial: `0 ${Weight.Unit.Pound}`,
			}),
		}
	}

	constructor(data?: DeepPartial<SourceFromSchema<WeightCriteriaSchema>>) {
		super(data)
	}

	matches(n: number): boolean {
		const qualifier = Weight.fromString(this.qualifier)
		const value = Weight.fromString(n.toString())
		switch (this.compare) {
			case NumericComparison.Option.AnyNumber:
				return true
			case NumericComparison.Option.EqualsNumber:
				return value === qualifier
			case NumericComparison.Option.NotEqualsNumber:
				return value !== qualifier
			case NumericComparison.Option.AtLeastNumber:
				return value >= qualifier
			case NumericComparison.Option.AtMostNumber:
				return value <= qualifier
		}
	}

	override toString(): string {
		return game.i18n.localize(`GURPS.WeightCriteria.${this.compare}.Name`)
	}

	altString(): string {
		return game.i18n.localize(`GURPS.WeightCriteria.${this.compare}.Alt`)
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
		return result + this.qualifier.toString()
	}
}

interface WeightCriteria
	extends foundry.abstract.DataModel<ItemDataModel, WeightCriteriaSchema>,
		ModelPropsFromSchema<WeightCriteriaSchema> {}

type WeightCriteriaSchema = {
	compare: fields.StringField<NumericComparison.Option, NumericComparison.Option, true, false, true>
	qualifier: fields.StringField<string, string, true, false, true>
}

export { WeightCriteria, type WeightCriteriaSchema }
