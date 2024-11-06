import { MaybeSchemaProp } from "types/foundry/common/data/fields.js"
import fields = foundry.data.fields
import { ToggleableFormInputConfig } from "@module/data/fields/helpers.ts"

class StringArrayField<
	TRequired extends boolean = true,
	TNullable extends boolean = false,
	THasInitial extends boolean = true,
> extends fields.ArrayField<
	fields.StringField<string, string, true, false, true>,
	fields.SourcePropFromDataField<fields.StringField<string, string, true, false, true>>[],
	fields.ModelPropFromDataField<fields.StringField<string, string, true, false, true>>[],
	TRequired,
	TNullable,
	THasInitial
> {
	constructor(
		options?: fields.ArrayFieldOptions<
			fields.SourcePropFromDataField<fields.StringField<string, string, true, false, true>>[],
			TRequired,
			TNullable,
			THasInitial
		>,
		context?: fields.DataFieldContext,
	) {
		super(new fields.StringField({ required: true, nullable: false }), options, context)
	}

	protected override _toInput(config: ToggleableFormInputConfig<string>): HTMLElement | HTMLCollection {
		if (!config.value) config.value = ""
		else if (Array.isArray(config.value)) config.value = config.value.join(", ")
		if (config.editable === false) {
			const element = document.createElement("span")
			element.classList.add("input-disabled")
			element.innerHTML = config.value ?? ""
			return element
		}
		return foundry.applications.fields.createTextInput(config)
	}

	override clean(
		value: unknown,
		options?: fields.CleanFieldOptions | undefined,
	): MaybeSchemaProp<
		fields.SourcePropFromDataField<fields.StringField<string, string, true, false, true>>[],
		TRequired,
		TNullable,
		THasInitial
	> {
		function onlyUnique(value: string, index: number, array: string[]) {
			return array.indexOf(value) === index && value !== ""
		}

		if (Array.isArray(value)) {
			value = value
				.join(",")
				.split(",")
				.map((e: string) => e.trim())
				.filter((v, i, a) => onlyUnique(v, i, a))
		} else if (typeof value === "string") {
			value = value
				.split(",")
				.map((e: string) => e.trim())
				.filter((v, i, a) => onlyUnique(v, i, a))
		}
		return super.clean(value, options)
	}
}

export { StringArrayField }
