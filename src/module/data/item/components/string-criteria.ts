import { Nameable } from "@module/util/nameable.ts"
import { StringComparison } from "@util/enum/string-comparison.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import fields = foundry.data.fields

class StringCriteria<TSchema extends StringCriteriaSchema = StringCriteriaSchema> extends foundry.abstract.DataModel<
	foundry.abstract.DataModel,
	TSchema
> {
	static override defineSchema(): StringCriteriaSchema {
		const fields = foundry.data.fields
		return {
			compare: new fields.StringField({
				required: true,
				nullable: false,
				blank: false,
				choices: StringComparison.OptionsChoices,
				initial: StringComparison.Option.AnyString,
			}),
			qualifier: new fields.StringField({ required: true, nullable: false }),
		}
	}

	matches(replacements: Map<string, string>, value: string): boolean {
		value = Nameable.apply(value, replacements)
		switch (this.compare) {
			case StringComparison.Option.AnyString:
				return true
			case StringComparison.Option.IsString:
				return equalFold(value, this.qualifier)
			case StringComparison.Option.IsNotString:
				return !equalFold(value, this.qualifier)
			case StringComparison.Option.ContainsString:
				return this.qualifier.toLowerCase().includes(value.toLowerCase())
			case StringComparison.Option.DoesNotContainString:
				return !this.qualifier.toLowerCase().includes(value.toLowerCase())
			case StringComparison.Option.StartsWithString:
				return this.qualifier.toLowerCase().startsWith(value.toLowerCase())
			case StringComparison.Option.DoesNotStartWithString:
				return !this.qualifier.toLowerCase().startsWith(value.toLowerCase())
			case StringComparison.Option.EndsWithString:
				return this.qualifier.toLowerCase().endsWith(value.toLowerCase())
			case StringComparison.Option.DoesNotEndWithString:
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
			case StringComparison.Option.AnyString:
			case StringComparison.Option.IsString:
			case StringComparison.Option.ContainsString:
			case StringComparison.Option.StartsWithString:
			case StringComparison.Option.EndsWithString:
				return matches > 0
			case StringComparison.Option.IsNotString:
			case StringComparison.Option.DoesNotContainString:
			case StringComparison.Option.DoesNotStartWithString:
			case StringComparison.Option.DoesNotEndWithString:
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
			case StringComparison.Option.IsNotString:
			case StringComparison.Option.DoesNotContainString:
			case StringComparison.Option.DoesNotStartWithString:
			case StringComparison.Option.DoesNotEndWithString:
				return LocalizeGURPS.translations.gurps.string_criteria.alt_string[this.compare]
			default:
				return this.toString()
		}
	}

	describe(qualifier: string): string {
		if (this.compare === StringComparison.Option.AnyString)
			return LocalizeGURPS.translations.GURPS.Enum.StringComparison[this.compare].Tooltip
		return LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Enum.StringComparison[this.compare].Tooltip, {
			qualifier,
		})
	}

	describeWithPrefix(prefix: string, notPrefix: string, qualifier: string): string {
		let info = ""
		if (prefix === notPrefix)
			info = LocalizeGURPS.format(prefix, {
				value: LocalizeGURPS.translations.GURPS.Enum.StringComparison[this.compare].Tooltip,
			})
		else {
			info = LocalizeGURPS.format(notPrefix, {
				value: LocalizeGURPS.translations.GURPS.Enum.StringComparison[this.compare].Tooltip,
			})
		}
		if (this.compare === StringComparison.Option.AnyString) return info
		return LocalizeGURPS.format(info, { qualifier })
	}
}

interface StringCriteria extends ModelPropsFromSchema<StringCriteriaSchema> {}

type StringCriteriaSchema = {
	compare: fields.StringField<StringComparison.Option, StringComparison.Option, true, false, true>
	qualifier: fields.StringField<string, string, true, false, true>
}

function equalFold(s: string, t: string): boolean {
	if (!s || !t) return false
	return s.toLowerCase() === t.toLowerCase()
}

function includesFold(s: string, t: string): boolean {
	if (!s && !t) return false
	return s.toLowerCase().includes(t.toLowerCase())
}

export { StringCriteria, equalFold, includesFold, type StringCriteriaSchema }
