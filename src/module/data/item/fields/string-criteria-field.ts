import { StringCriteria } from "@module/util/index.ts"
import { StringComparison } from "@util/enum/index.ts"
import fields = foundry.data.fields

class StringCriteriaField<
	TRequired extends boolean = true,
	TNullable extends boolean = false,
	THasInitial extends boolean = true,
> extends fields.EmbeddedDataField<StringCriteria, TRequired, TNullable, THasInitial> {
	constructor(
		options?: fields.ObjectFieldOptions<
			SourceFromSchema<StringCriteria["schema"]["fields"]>,
			TRequired,
			TNullable,
			THasInitial
		>,
		context?: fields.DataFieldContext,
	) {
		if (options?.choices) {
			const { choices, ...restOptions } = options
			super(StringCriteria, restOptions, context)
			;(this.fields.compare as any).choices = options.choices as Record<StringComparison.Option, string>
		} else {
			super(StringCriteria, options, context)
		}
	}
}

export { StringCriteriaField }
