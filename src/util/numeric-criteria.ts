import type { NumberField, StringField } from "types/foundry/common/data/fields.js"
import { LocalizeGURPS } from "./localize.ts"

export enum NumericCompareType {
	AnyNumber = "none",
	EqualsNumber = "is",
	NotEqualsNumber = "is_not",
	AtLeastNumber = "at_least",
	AtMostNumber = "at_most",
}

export const AllNumericCompareTypes: NumericCompareType[] = [
	NumericCompareType.AnyNumber,
	NumericCompareType.EqualsNumber,
	NumericCompareType.NotEqualsNumber,
	NumericCompareType.AtLeastNumber,
	NumericCompareType.AtMostNumber,
]

export const ContainedQuantityNumericCompareTypes: NumericCompareType[] = [
	NumericCompareType.EqualsNumber,
	NumericCompareType.AtLeastNumber,
	NumericCompareType.AtMostNumber,
]

export interface NumericCriteriaObj {
	compare?: NumericCompareType
	qualifier?: number
}

export type NumericCriteriaSchema = {
	compare: StringField<NumericCompareType, NumericCompareType, true, false, true>
	qualifier: NumberField<number, number, true, false, true>
}

export class NumericCriteria {
	declare compare: NumericCompareType

	declare qualifier: number

	static defineSchema(): NumericCriteriaSchema {
		return {
			compare: new foundry.data.fields.StringField<NumericCompareType, NumericCompareType, true>({
				required: true,
				choices: AllNumericCompareTypes,
				initial: NumericCompareType.AnyNumber,
			}),
			qualifier: new foundry.data.fields.NumberField(),
		}
	}

	constructor(data: NumericCriteriaObj) {
		this.compare = data.compare ?? NumericCompareType.AnyNumber
		this.qualifier = data.qualifier ?? 0
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

	toObject(): NumericCriteriaObj {
		return { compare: this.compare, qualifier: this.qualifier }
	}
}
