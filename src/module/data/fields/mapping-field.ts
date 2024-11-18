import { ErrorGURPS } from "@util"
import fields = foundry.data.fields
import { MaybeSchemaProp } from "types/foundry/common/data/fields.js"
import { abstract } from "types/foundry/client/foundry/index.js"

type MappingFieldInitialValueBuilder = (key: string, initial: object, existing: object) => object

type MappingFieldOptions<
	TSourceProp extends object,
	TRequired extends boolean = true,
	TNullable extends boolean = false,
	THasInitial extends boolean = true,
> = fields.DataFieldOptions<TSourceProp, TRequired, TNullable, THasInitial> & {
	initialKeys?: string[]
	initialValue?: MappingFieldInitialValueBuilder
	initialKeysOnly?: boolean
}

class MappingField<
	TValueProp extends fields.DataField,
	TSourceProp extends object = object,
	TModelProp extends object = object,
	TRequired extends boolean = true,
	TNullable extends boolean = false,
	THasInitial extends boolean = true,
> extends fields.ObjectField<TSourceProp, TModelProp, TRequired, TNullable, THasInitial> {
	model: TValueProp
	declare initialKeys: string[]
	declare initialValue: MappingFieldInitialValueBuilder
	initialKeysOnly = false

	constructor(
		model: TValueProp,
		// options: MappingFieldOptions<TKeyProp, TValueProp, TSourceProp, TRequired, TNullable, THasInitial>,
		options: MappingFieldOptions<TSourceProp, TRequired, TNullable, THasInitial>,
	) {
		if (!(model instanceof fields.DataField)) {
			throw ErrorGURPS("MappingField must have a DataField as its contained element")
		}
		super(options)

		this.model = model
		// TODO: fix
		model.parent = this as any
	}

	/* -------------------------------------------- */

	static override get _defaults(): fields.ObjectFieldOptions<object, boolean, boolean, boolean> {
		return foundry.utils.mergeObject(super._defaults, {
			initialKeys: null,
			initialValue: null,
			initialKeysOnly: false,
		})
	}

	/* -------------------------------------------- */

	protected override _cleanType(
		value: Record<string, unknown>,
		options?: fields.CleanFieldOptions | undefined,
	): unknown {
		Object.entries(value).forEach(([k, v]) => (value[k] = this.model.clean(v, options)))
		return value
	}

	/* -------------------------------------------- */

	override getInitialValue(
		data?: object | undefined,
	): fields.MaybeSchemaProp<TSourceProp, TRequired, TNullable, THasInitial> {
		let keys = this.initialKeys
		const initial = super.getInitialValue(data)
		if (!keys || !foundry.utils.isEmpty(initial)) return initial
		if (!(keys instanceof Array)) keys = Object.keys(keys)
		for (const key of keys) (initial as any)[key] = this._getInitialValueForKey(key)
		return initial
	}

	/* -------------------------------------------- */

	/**
	 * Get the initial value for the provided key.
	 * @param {string} key       Key within the object being built.
	 * @param {object} [object]  Any existing mapping data.
	 * @returns {*}              Initial value based on provided field type.
	 */
	_getInitialValueForKey(key: string, object?: object): object {
		const initial = this.model.getInitialValue()
		return this.initialValue?.(key, initial as object, object ?? {}) ?? initial
	}

	/* -------------------------------------------- */

	override _validateType(value: unknown, options: fields.DataFieldValidationOptions = {}) {
		if (foundry.utils.getType(value) !== "Object") throw new Error("must be an Object")
		const errors = this._validateValues(value as object, options)
		if (!foundry.utils.isEmpty(errors))
			throw new foundry.data.validation.DataModelValidationError(Object.values(errors)[0])
	}

	/* -------------------------------------------- */

	/**
	 * Validate each value of the object.
	 */
	_validateValues(
		value: object,
		options: fields.DataFieldValidationOptions,
	): Record<string, foundry.data.validation.DataModelValidationFailure> {
		const errors: Record<string, foundry.data.validation.DataModelValidationFailure> = {}
		for (const [k, v] of Object.entries(value)) {
			const error = this.model.validate(v, options)
			if (error) errors[k] = error
		}
		return errors
	}

	/* -------------------------------------------- */

	override initialize(
		value: unknown,
		model: ConstructorOf<abstract.DataModel>,
		options: fields.ObjectFieldOptions<TSourceProp, TRequired, TNullable, THasInitial> = {},
	): fields.MaybeSchemaProp<TModelProp, TRequired, TNullable, THasInitial> {
		if (!value) return value as MaybeSchemaProp<TModelProp, TRequired, TNullable, THasInitial>
		const obj: Record<string, unknown> = {}
		const initialKeys = this.initialKeys instanceof Array ? this.initialKeys : Object.keys(this.initialKeys ?? {})
		const keys = this.initialKeysOnly ? initialKeys : Object.keys(value)
		for (const key of keys) {
			const data = (value as Record<string, unknown>)[key] ?? this._getInitialValueForKey(key, value)
			obj[key] = this.model.initialize(data, model, options)
		}
		return obj as MaybeSchemaProp<TModelProp, TRequired, TNullable, THasInitial>
	}

	/* -------------------------------------------- */

	protected override _getField(path: string[]): fields.DataField | undefined {
		if (path.length === 0) return this
		else if (path.length === 1) return this.model
		path.shift()
		// @ts-expect-error ignoring protected in this case
		return this.model._getField(path)
	}
}

export { MappingField, type MappingFieldOptions }
