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

export class NumericCriteria {
	declare compare: NumericCompareType

	declare qualifier: number

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
}
