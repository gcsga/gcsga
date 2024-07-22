import { LocalizeGURPS } from "../../util/localize.ts"
import { AllStringCompareTypes, StringCompareType } from "@module/data/constants.ts"
import { StringCriteriaSchema } from "./data.ts"
import type { ItemGURPS } from "@item"

class StringCriteria extends foundry.abstract.DataModel<ItemGURPS, StringCriteriaSchema> {

	static override defineSchema(): StringCriteriaSchema {
		const fields = foundry.data.fields

		return {
			compare: new fields.StringField({ choices: AllStringCompareTypes, initial: StringCompareType.AnyString }),
			qualifier: new fields.StringField()
		}
	}

	constructor(data?: DeepPartial<SourceFromSchema<StringCriteriaSchema>>) {
		super(data)
	}

	matches(s: string): boolean {
		switch (this.compare) {
			case StringCompareType.AnyString:
				return true
			case StringCompareType.IsString:
				return equalFold(s, this.qualifier)
			case StringCompareType.IsNotString:
				return !equalFold(s, this.qualifier)
			case StringCompareType.ContainsString:
				return this.qualifier.toLowerCase().includes(s.toLowerCase())
			case StringCompareType.DoesNotContainString:
				return !this.qualifier.toLowerCase().includes(s.toLowerCase())
			case StringCompareType.StartsWithString:
				return this.qualifier.toLowerCase().startsWith(s.toLowerCase())
			case StringCompareType.DoesNotStartWithString:
				return !this.qualifier.toLowerCase().startsWith(s.toLowerCase())
			case StringCompareType.EndsWithString:
				return this.qualifier.toLowerCase().endsWith(s.toLowerCase())
			case StringCompareType.DoesNotEndWithString:
				return !this.qualifier.toLowerCase().endsWith(s.toLowerCase())
		}
	}

	matchesList(...s: string[]): boolean {
		if (s.length === 0) return this.matches("")
		let matches = 0
		for (const one of s) {
			if (this.matches(one)) matches += 1
		}
		switch (this.compare) {
			case StringCompareType.AnyString:
			case StringCompareType.IsString:
			case StringCompareType.ContainsString:
			case StringCompareType.StartsWithString:
			case StringCompareType.EndsWithString:
				return matches > 0
			case StringCompareType.IsNotString:
			case StringCompareType.DoesNotContainString:
			case StringCompareType.DoesNotStartWithString:
			case StringCompareType.DoesNotEndWithString:
				return matches === s.length
		}
	}

	override toString(): string {
		return LocalizeGURPS.translations.gurps.string_criteria.string[this.compare]
	}

	altString(): string {
		switch (this.compare) {
			case StringCompareType.IsNotString:
			case StringCompareType.DoesNotContainString:
			case StringCompareType.DoesNotStartWithString:
			case StringCompareType.DoesNotEndWithString:
				return LocalizeGURPS.translations.gurps.string_criteria.alt_string[this.compare]
			default:
				return this.toString()
		}
	}

	describe(): string {
		const result = this.toString()
		if (this.compare === StringCompareType.AnyString) return result
		return `${result} "${this.qualifier}"`
	}
}

interface StringCriteria extends foundry.abstract.DataModel<ItemGURPS, StringCriteriaSchema>, ModelPropsFromSchema<StringCriteriaSchema> { }


function equalFold(s: string, t: string): boolean {
	if (!s || !t) return false
	return s.toLowerCase() === t.toLowerCase()
}

function includesFold(s: string, t: string): boolean {
	if (!s && !t) return false
	return s.toLowerCase().includes(t.toLowerCase())
}

export { StringCriteria, type StringCriteriaSchema, equalFold, includesFold }


// export class StringCriteria {
// 	compare: StringCompareType
//
// 	qualifier: string
//
// 	constructor(data: DeepPartial<SourceFromSchema<StringCriteriaSchema>>) {
// 		this.compare = data.compare ?? StringCompareType.AnyString
// 		this.qualifier = data.qualifier ?? ""
// 	}
//
// 	matches(s: string): boolean {
// 		switch (this.compare) {
// 			case StringCompareType.AnyString:
// 				return true
// 			case StringCompareType.IsString:
// 				return equalFold(s, this.qualifier)
// 			case StringCompareType.IsNotString:
// 				return !equalFold(s, this.qualifier)
// 			case StringCompareType.ContainsString:
// 				return this.qualifier.toLowerCase().includes(s.toLowerCase())
// 			case StringCompareType.DoesNotContainString:
// 				return !this.qualifier.toLowerCase().includes(s.toLowerCase())
// 			case StringCompareType.StartsWithString:
// 				return this.qualifier.toLowerCase().startsWith(s.toLowerCase())
// 			case StringCompareType.DoesNotStartWithString:
// 				return !this.qualifier.toLowerCase().startsWith(s.toLowerCase())
// 			case StringCompareType.EndsWithString:
// 				return this.qualifier.toLowerCase().endsWith(s.toLowerCase())
// 			case StringCompareType.DoesNotEndWithString:
// 				return !this.qualifier.toLowerCase().endsWith(s.toLowerCase())
// 		}
// 	}
//
// 	matchesList(...s: string[]): boolean {
// 		if (s.length === 0) return this.matches("")
// 		let matches = 0
// 		for (const one of s) {
// 			if (this.matches(one)) matches += 1
// 		}
// 		switch (this.compare) {
// 			case StringCompareType.AnyString:
// 			case StringCompareType.IsString:
// 			case StringCompareType.ContainsString:
// 			case StringCompareType.StartsWithString:
// 			case StringCompareType.EndsWithString:
// 				return matches > 0
// 			case StringCompareType.IsNotString:
// 			case StringCompareType.DoesNotContainString:
// 			case StringCompareType.DoesNotStartWithString:
// 			case StringCompareType.DoesNotEndWithString:
// 				return matches === s.length
// 		}
// 	}
//
// 	toString(): string {
// 		return LocalizeGURPS.translations.gurps.string_criteria.string[this.compare]
// 	}
//
// 	altString(): string {
// 		switch (this.compare) {
// 			case StringCompareType.IsNotString:
// 			case StringCompareType.DoesNotContainString:
// 			case StringCompareType.DoesNotStartWithString:
// 			case StringCompareType.DoesNotEndWithString:
// 				return LocalizeGURPS.translations.gurps.string_criteria.alt_string[this.compare]
// 			default:
// 				return this.toString()
// 		}
// 	}
//
// 	describe(): string {
// 		const result = this.toString()
// 		if (this.compare === StringCompareType.AnyString) return result
// 		return `${result} "${this.qualifier}"`
// 	}
//
// 	toObject(): SourceFromSchema<StringCriteriaSchema> {
// 		return { compare: this.compare, qualifier: this.qualifier }
// 	}
// }
//
