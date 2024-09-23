import { NumericComparison } from "@util"
import fields = foundry.data.fields
import { NumericCriteria } from "@module/util/index.ts"

class NumericCriteriaField<
	TRequired extends boolean = true,
	TNullable extends boolean = false,
	THasInitial extends boolean = true,
> extends fields.EmbeddedDataField<NumericCriteria, TRequired, TNullable, THasInitial> {
	constructor(
		options?: fields.ObjectFieldOptions<
			SourceFromSchema<NumericCriteria["schema"]["fields"]>,
			TRequired,
			TNullable,
			THasInitial
		>,
		context?: fields.DataFieldContext,
	) {
		if (options?.choices) {
			const { choices, ...restOptions } = options
			super(NumericCriteria, restOptions, context)
			;(this.fields.compare as any).choices = options.choices as Record<NumericComparison.Option, string>
		} else {
			super(NumericCriteria, options, context)
		}
	}
}

export { NumericCriteriaField }
