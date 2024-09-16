import { LocalizeGURPS } from "../../util/localize.ts"
import { AllStringCompareTypes, StringCompareType } from "@module/data/constants.ts"
import type { StringCriteriaSchema } from "./data.ts"
import { Nameable } from "./nameable.ts"
import { ItemDataModel } from "@module/data/abstract.ts"

class StringCriteria extends foundry.abstract.DataModel<ItemDataModel, StringCriteriaSchema> {
	static override defineSchema(): StringCriteriaSchema {
		const fields = foundry.data.fields

		return {
			compare: new fields.StringField({ choices: AllStringCompareTypes, initial: StringCompareType.AnyString }),
			qualifier: new fields.StringField(),
		}
	}

	constructor(data?: DeepPartial<SourceFromSchema<StringCriteriaSchema>>) {
		super(data)
	}

	matches(replacements: Map<string, string>, value: string): boolean {
		value = Nameable.apply(value, replacements)
		switch (this.compare) {
			case StringCompareType.AnyString:
				return true
			case StringCompareType.IsString:
				return equalFold(value, this.qualifier)
			case StringCompareType.IsNotString:
				return !equalFold(value, this.qualifier)
			case StringCompareType.ContainsString:
				return this.qualifier.toLowerCase().includes(value.toLowerCase())
			case StringCompareType.DoesNotContainString:
				return !this.qualifier.toLowerCase().includes(value.toLowerCase())
			case StringCompareType.StartsWithString:
				return this.qualifier.toLowerCase().startsWith(value.toLowerCase())
			case StringCompareType.DoesNotStartWithString:
				return !this.qualifier.toLowerCase().startsWith(value.toLowerCase())
			case StringCompareType.EndsWithString:
				return this.qualifier.toLowerCase().endsWith(value.toLowerCase())
			case StringCompareType.DoesNotEndWithString:
				return !this.qualifier.toLowerCase().endsWith(value.toLowerCase())
		}
	}

	matchesList(replacements: Map<string, string>, ...value: string[]): boolean {
		value = Nameable.applyToList(value, replacements)
		if (value.length === 0) return this.matches(replacements, "")
		let matches = 0
		for (const one of value) {
			if (this.matches(replacements, one)) matches += 1
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
				return matches === value.length
		}
	}

	override toString(replacements: Map<string, string> = new Map()): string {
		return this.describe(Nameable.apply(this.qualifier, replacements))
	}

	toStringWithPrefix(replacements: Map<string, string>, prefix: string, notPrefix: string): string {
		return this.describeWithPrefix(prefix, notPrefix, Nameable.apply(this.qualifier, replacements))
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

	describe(qualifier: string): string {
		if (this.compare === StringCompareType.AnyString)
			return LocalizeGURPS.translations.GURPS.Enum.StringCompareType[this.compare]
		return LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Enum.StringCompareType[this.compare], {
			qualifier,
		})
	}

	describeWithPrefix(prefix: string, notPrefix: string, qualifier: string): string {
		let info = ""
		if (prefix === notPrefix)
			info = LocalizeGURPS.format(prefix, {
				value: LocalizeGURPS.translations.GURPS.Enum.StringCompareType[this.compare],
			})
		else {
			info = LocalizeGURPS.format(notPrefix, {
				value: LocalizeGURPS.translations.GURPS.Enum.StringCompareType[this.compare],
			})
		}
		if (this.compare === StringCompareType.AnyString) return info
		return LocalizeGURPS.format(info, { qualifier })
	}
}

interface StringCriteria
	extends foundry.abstract.DataModel<ItemDataModel, StringCriteriaSchema>,
		ModelPropsFromSchema<StringCriteriaSchema> {}

function equalFold(s: string, t: string): boolean {
	if (!s || !t) return false
	return s.toLowerCase() === t.toLowerCase()
}

function includesFold(s: string, t: string): boolean {
	if (!s && !t) return false
	return s.toLowerCase().includes(t.toLowerCase())
}

export { StringCriteria, type StringCriteriaSchema, equalFold, includesFold }
