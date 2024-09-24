import fields = foundry.data.fields

// Boolean field which produces a select input box instead of a checkbox
class BooleanSelectField<
	TSourceProp extends boolean = boolean,
	TModelProp extends NonNullable<JSONValue> = TSourceProp,
	TRequired extends boolean = true,
	TNullable extends boolean = false,
	THasInitial extends boolean = true,
> extends fields.BooleanField<TSourceProp, TModelProp, TRequired, TNullable, THasInitial> {
	choices:
		| readonly TSourceProp[]
		| Record<string, string>
		| (() => readonly TSourceProp[] | Record<string | number, string>) = {
		true: "GURPS.Enum.Boolean.true",
		false: "GURPS.Enum.Boolean.false",
	}

	constructor(
		options?: fields.DataFieldOptions<TSourceProp, TRequired, TNullable, THasInitial>,
		context?: fields.DataFieldContext,
	) {
		super(options, context)
		if (options?.choices) this.choices = options.choices
	}

	protected override _toInput(config: FormInputConfig<string> & SelectInputConfig): HTMLElement | HTMLCollection {
		const choices = this.choices
		config.options = fields.StringField._getChoices({ choices })

		return foundry.applications.fields.createSelectInput(config)
	}
}

export { BooleanSelectField }
