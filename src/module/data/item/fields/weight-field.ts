import { Int, Weight } from "@util"
import fields = foundry.data.fields
import { ToggleableStringField } from "@module/data/fields/toggleable-string-fields.ts"
import { ToggleableFormInputConfig } from "@module/data/fields/helpers.ts"

interface WeightFieldOptions<
	TSourceProp extends string,
	TRequired extends boolean,
	TNullable extends boolean,
	THasInitial extends boolean,
> extends fields.StringFieldOptions<TSourceProp, TRequired, TNullable, THasInitial> {
	/* Should the fields allow percentages as a unit?*/
	allowPercent?: boolean
}

class WeightField<
	TSourceProp extends string = string,
	TModelProp extends NonNullable<JSONValue> = TSourceProp,
	TRequired extends boolean = false,
	TNullable extends boolean = false,
	THasInitial extends boolean = true,
> extends ToggleableStringField<TSourceProp, TModelProp, TRequired, TNullable, THasInitial> {
	allowPercent: boolean

	constructor(
		options?: WeightFieldOptions<TSourceProp, TRequired, TNullable, THasInitial>,
		context?: fields.DataFieldContext,
	) {
		super(options, context)
		this.allowPercent = options?.allowPercent ?? false
	}

	protected override _toInput(config?: ToggleableFormInputConfig<string> | undefined): HTMLElement | HTMLCollection {
		return super._toInput(config)
	}

	override clean(
		value: unknown,
		options: fields.CleanFieldOptions,
	): fields.MaybeSchemaProp<TSourceProp, TRequired, TNullable, THasInitial> {
		if (typeof value !== "string") return super.clean(value, options)

		if (this.allowPercent && value.trim().endsWith("%")) {
			value = `${Int.fromStringForced(value)}%`
		} else {
			value = Weight.format(Weight.fromStringForced(value, Weight.Unit.Pound), Weight.Unit.Pound)
		}

		return super.clean(value, options)
	}
}

export { WeightField }
