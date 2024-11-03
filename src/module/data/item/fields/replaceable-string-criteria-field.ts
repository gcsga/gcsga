import { StringComparison } from "@util/enum/index.ts"
import fields = foundry.data.fields
import { ReplaceableStringCriteria } from "../components/replaceable-string-criteria.ts"

class ReplaceableStringCriteriaField<
	TRequired extends boolean = true,
	TNullable extends boolean = false,
	THasInitial extends boolean = true,
> extends fields.EmbeddedDataField<ReplaceableStringCriteria, TRequired, TNullable, THasInitial> {
	constructor(
		options?: fields.ObjectFieldOptions<
			SourceFromSchema<ReplaceableStringCriteria["schema"]["fields"]>,
			TRequired,
			TNullable,
			THasInitial
		>,
		context?: fields.DataFieldContext,
	) {
		if (options?.choices) {
			const { choices, ...restOptions } = options
			super(ReplaceableStringCriteria, restOptions, context)
			;(this.fields.compare as any).choices = options.choices as Record<StringComparison.Option, string>
		} else {
			super(ReplaceableStringCriteria, options, context)
		}
	}
}

export { ReplaceableStringCriteriaField }
