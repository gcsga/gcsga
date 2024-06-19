import * as R from "remeda"
import { SlugCamel, sluggify } from "@util"
import type {
	CleanFieldOptions,
	DataField,
	DataFieldValidationOptions,
	MaybeSchemaProp,
	ModelPropFromDataField,
	NumberField,
	ObjectFieldOptions,
	SourcePropFromDataField,
	StringField,
	StringFieldOptions,
} from "types/foundry/common/data/fields.js"
import { DataModelValidationFailure } from "types/foundry/common/data/validation-failure.js"

/* -------------------------------------------- */
/*  System `DataSchema` `DataField`s            */
/* -------------------------------------------- */

// const { fields } = foundry.data

/** A `StringField` that does not cast the source value */
class StrictStringField<
	TSourceProp extends string,
	TModelProp extends NonNullable<JSONValue> = TSourceProp,
	TRequired extends boolean = false,
	TNullable extends boolean = false,
	THasInitial extends boolean = boolean,
> extends foundry.data.fields.StringField<TSourceProp, TModelProp, TRequired, TNullable, THasInitial> {
	protected override _cast(value: unknown): unknown {
		return value
	}
}

/** A sluggified string field */
class SlugField<
	TRequired extends boolean = true,
	TNullable extends boolean = boolean,
	THasInitial extends boolean = boolean,
> extends StrictStringField<string, string, TRequired, TNullable, THasInitial> {
	constructor(options: SlugFieldOptions<TRequired, TNullable, THasInitial> = {}) {
		options.blank = false
		options.camel ??= null
		super(options)
	}

	protected static override get _defaults(): SlugFieldOptions<boolean, boolean, boolean> {
		return { ...super._defaults, nullable: true, initial: null, camel: null }
	}

	protected override _cleanType(
		value: Maybe<string>,
		options?: CleanFieldOptions,
	): MaybeSchemaProp<string, TRequired, TNullable, THasInitial>
	protected override _cleanType(value: Maybe<string>, options?: CleanFieldOptions): unknown {
		const slug = super._cleanType(value, options)
		const camel = this.options.camel ?? null
		return typeof slug === "string" ? sluggify(slug, { camel }) : slug
	}
}

interface SlugField<
	TRequired extends boolean = true,
	TNullable extends boolean = boolean,
	THasInitial extends boolean = boolean,
> extends StrictStringField<string, string, TRequired, TNullable, THasInitial> {
	options: SlugFieldOptions<TRequired, TNullable, THasInitial>
}

interface SlugFieldOptions<TRequired extends boolean, TNullable extends boolean, THasInitial extends boolean>
	extends StringFieldOptions<string, TRequired, TNullable, THasInitial> {
	camel?: SlugCamel
}

type RecordFieldModelProp<
	TKeyField extends StringField<string, string, true, false, false> | NumberField<number, number, true, false, false>,
	TValueField extends DataField,
	TDense extends boolean = false,
> = TDense extends true
	? Record<ModelPropFromDataField<TKeyField>, ModelPropFromDataField<TValueField>>
	: TDense extends false
		? Partial<Record<ModelPropFromDataField<TKeyField>, ModelPropFromDataField<TValueField>>>
		:
				| Record<ModelPropFromDataField<TKeyField>, ModelPropFromDataField<TValueField>>
				| Partial<Record<ModelPropFromDataField<TKeyField>, ModelPropFromDataField<TValueField>>>

type RecordFieldSourceProp<
	TKeyField extends StringField<string, string, true, false, false> | NumberField<number, number, true, false, false>,
	TValueField extends DataField,
	/** Whether this is to be treated as a "dense" record; i.e., any valid key should return a value */
	TDense extends boolean = false,
> = TDense extends true
	? Record<SourcePropFromDataField<TKeyField>, SourcePropFromDataField<TValueField>>
	: TDense extends false
		? Partial<Record<SourcePropFromDataField<TKeyField>, SourcePropFromDataField<TValueField>>>
		:
				| Record<SourcePropFromDataField<TKeyField>, SourcePropFromDataField<TValueField>>
				| Partial<Record<SourcePropFromDataField<TKeyField>, SourcePropFromDataField<TValueField>>>

class RecordField<
	TKeyField extends StringField<string, string, true, false, false> | NumberField<number, number, true, false, false>,
	TValueField extends DataField,
	TRequired extends boolean = true,
	TNullable extends boolean = false,
	THasInitial extends boolean = true,
	TDense extends boolean = false,
> extends foundry.data.fields.ObjectField<
	RecordFieldSourceProp<TKeyField, TValueField, TDense>,
	RecordFieldModelProp<TKeyField, TValueField, TDense>,
	TRequired,
	TNullable,
	THasInitial
> {
	static override recursive = true

	keyField: TKeyField
	valueField: TValueField

	constructor(
		keyField: TKeyField,
		valueField: TValueField,
		options?: ObjectFieldOptions<
			RecordFieldSourceProp<TKeyField, TValueField, TDense>,
			TRequired,
			TNullable,
			THasInitial
		>,
	) {
		super(options)

		if (!this._isValidKeyFieldType(keyField)) {
			throw new Error(`key field must be a StringField or a NumberField`)
		}
		this.keyField = keyField

		if (!(valueField instanceof foundry.data.fields.DataField)) {
			throw new Error(`${this.name} must have a DataField as its contained field`)
		}
		this.valueField = valueField
	}

	protected _isValidKeyFieldType(
		keyField: unknown,
	): keyField is StringField<string, string, true, false, false> | NumberField<number, number, true, false, false> {
		if (
			keyField instanceof foundry.data.fields.StringField ||
			keyField instanceof foundry.data.fields.NumberField
		) {
			if (keyField.options.required !== true || keyField.options.nullable === true) {
				throw new Error(`key field must be required and non-nullable`)
			}
			return true
		}
		return false
	}

	protected _validateValues(
		values: Record<string, unknown>,
		options?: DataFieldValidationOptions,
	): DataModelValidationFailure | void {
		const validationFailure = foundry.data.validation.DataModelValidationFailure
		const failures = new validationFailure()
		for (const [key, value] of Object.entries(values)) {
			// If this is a deletion key for a partial update, skip
			if (key.startsWith("-=") && options?.partial) continue

			const keyFailure = this.keyField.validate(key, options)
			if (keyFailure) {
				failures.elements.push({ id: key, failure: keyFailure })
			}
			const valueFailure = this.valueField.validate(value, options)
			if (valueFailure) {
				failures.elements.push({ id: `${key}-value`, failure: valueFailure })
			}
		}
		if (failures.elements.length) {
			failures.unresolved = failures.elements.some(e => e.failure.unresolved)
			return failures
		}
	}

	protected override _cleanType(
		values: Record<string, unknown>,
		options?: CleanFieldOptions | undefined,
	): Record<string, unknown> {
		for (const [key, value] of Object.entries(values)) {
			if (key.startsWith("-=")) continue // Don't attempt to clean deletion entries
			values[key] = this.valueField.clean(value, options)
		}
		return values
	}

	protected override _validateType(
		values: unknown,
		options?: DataFieldValidationOptions,
	): boolean | DataModelValidationFailure | void {
		if (!R.isPlainObject(values)) {
			return new foundry.data.validation.DataModelValidationFailure({ message: "must be an Object" })
		}
		return this._validateValues(values, options)
	}

	override initialize(
		values: object | null | undefined,
		model: ConstructorOf<foundry.abstract.DataModel>,
		options?: ObjectFieldOptions<RecordFieldSourceProp<TKeyField, TValueField>, TRequired, TNullable, THasInitial>,
	): MaybeSchemaProp<RecordFieldModelProp<TKeyField, TValueField, TDense>, TRequired, TNullable, THasInitial>
	override initialize(
		values: object | null | undefined,
		model: ConstructorOf<foundry.abstract.DataModel>,
		options?: ObjectFieldOptions<RecordFieldSourceProp<TKeyField, TValueField>, TRequired, TNullable, THasInitial>,
	): Record<string, unknown> | null | undefined {
		if (!values) return values
		const data: Record<string, unknown> = {}
		for (const [key, value] of Object.entries(values)) {
			data[key] = this.valueField.initialize(value, model, options)
		}
		return data
	}
}

/** A field that always results in a value of `null` */
class NullField extends foundry.data.fields.DataField<null, null, true, true, true> {
	constructor() {
		super({ required: true, nullable: true, initial: null })
	}

	protected override _cast(): null {
		return null
	}
}

export { NullField, RecordField, SlugField }
