import { NumericComparison } from "@util"
import fields = foundry.data.fields
import { WeightCriteria } from "@module/util/index.ts"

class WeightCriteriaField<
	TRequired extends boolean = true,
	TNullable extends boolean = false,
	THasInitial extends boolean = true,
> extends fields.EmbeddedDataField<WeightCriteria, TRequired, TNullable, THasInitial> {
	constructor(
		options?: fields.ObjectFieldOptions<
			SourceFromSchema<WeightCriteria["schema"]["fields"]>,
			TRequired,
			TNullable,
			THasInitial
		>,
		context?: fields.DataFieldContext,
	) {
		if (options?.choices) {
			const { choices, ...restOptions } = options
			super(WeightCriteria, restOptions, context)
			;(this.fields.compare as any).choices = options.choices as Record<NumericComparison.Option, string>
		} else {
			super(WeightCriteria, options, context)
		}
	}
}

export { WeightCriteriaField }
