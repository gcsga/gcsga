import { MappingField, MappingFieldOptions } from "@module/data/fields/mapping-field.ts"
import fields = foundry.data.fields
class ReplacementsField<
	TRequired extends boolean = true,
	TNullable extends boolean = false,
	THasInitial extends boolean = true,
> extends MappingField<fields.StringField, object, Map<string, string>, TRequired, TNullable, THasInitial> {
	constructor(options: MappingFieldOptions<fields.StringField, TRequired, TNullable, THasInitial> = {}) {
		super(new fields.StringField(), options)
	}

	/* -------------------------------------------- */

	override initialize(
		value: unknown,
		model: ConstructorOf<foundry.abstract.DataModel>,
		options: fields.ObjectFieldOptions<fields.StringField, TRequired, TNullable, THasInitial> = {},
	): Map<string, string> {
		super.initialize(value, model)
		const records = Object.entries(super.initialize(value, model, options) as unknown as [string, string])
		return new Map(records)
	}

	override toObject(value: Map<string, string>): Record<string, string> {
		return Object.fromEntries(value)
	}
}

export { ReplacementsField }
