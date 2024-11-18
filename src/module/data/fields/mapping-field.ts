// import { ErrorGURPS } from "@util"
// import { DataFieldOptions } from "types/foundry/common/data/fields.js"
// import fields = foundry.data.fields
//
// type MapFieldInitialValueBuilder = (key: string, initial: object, existing: object) => object
//
// type MapFieldOptions<
// 	TKeyProp extends string,
// 	TValueProp extends fields.DataField,
// 	TSourceProp extends Array<[TKeyProp, TValueProp]>,
// 	TRequired extends boolean = true,
// 	TNullable extends boolean = false,
// 	THasInitial extends boolean = true,
// > = DataFieldOptions<TSourceProp, TRequired, TNullable, THasInitial> & {
// 	initialKeys: string[]
// 	initialValue: MapFieldInitialValueBuilder
// 	initialKeysOnly: boolean
// }
//
// class MapField<
// 	TKeyProp extends string,
// 	TValueProp extends fields.DataField,
// 	TSourceProp extends Array<[TKeyProp, TValueProp]>,
// 	TModelProp extends Map<TKeyProp, TValueProp>,
// 	TRequired extends boolean = true,
// 	TNullable extends boolean = false,
// 	THasInitial extends boolean = true,
// > extends fields.ObjectField<TSourceProp, TModelProp, TRequired, TNullable, THasInitial> {
// 	model: TValueProp
// 	initialKeys: string[]
// 	initialValue: MapFieldInitialValueBuilder
// 	initialKeysOnly = false
//
// 	constructor(
// 		model: TValueProp,
// 		options: MapFieldOptions<TKeyProp, TValueProp, TSourceProp, TRequired, TNullable, THasInitial>,
// 	) {
// 		if (!(model instanceof fields.DataField)) {
// 			throw ErrorGURPS("MapField must have a DataField as its contained element")
// 		}
// 		super(options)
//
// 		this.model = model
// 		// TODO: fix
// 		model.parent = this as any
// 	}
//
// 	/* -------------------------------------------- */
//
// 	static override get _defaults(): fields.ObjectFieldOptions<object, boolean, boolean, boolean> {
// 		return foundry.utils.mergeObject(super._defaults, {
// 			initialKeys: null,
// 			initialValue: null,
// 			initialKeysOnly: false,
// 		})
// 	}
//
// 	/* -------------------------------------------- */
//
// 	protected override _cleanType(
// 		value: Record<string, unknown>,
// 		options?: fields.CleanFieldOptions | undefined,
// 	): unknown {
// 		Object.entries(value).forEach(([k, v]) => (value[k] = this.model.clean(v, options)))
// 		return value
// 	}
//
// 	/* -------------------------------------------- */
//
// 	override getInitialValue(
// 		data?: object | undefined,
// 	): fields.MaybeSchemaProp<TSourceProp, TRequired, TNullable, THasInitial> {
// 		let keys = this.initialKeys
// 		const initial = super.getInitialValue(data)
// 		if (!keys || !foundry.utils.isEmpty(initial)) return initial
// 		if (!(keys instanceof Array)) keys = Object.keys(keys)
// 		for (const key of keys) initial[key] = this._getInitialValueForKey(key)
// 		return initial
// 	}
//
// 	/* -------------------------------------------- */
//
// 	/**
// 	 * Get the initial value for the provided key.
// 	 * @param {string} key       Key within the object being built.
// 	 * @param {object} [object]  Any existing mapping data.
// 	 * @returns {*}              Initial value based on provided field type.
// 	 */
// 	_getInitialValueForKey(key: string, object: TValueProp): object {
// 		const initial = this.model.getInitialValue()
// 		return this.initialValue?.(key, initial, object) ?? initial
// 	}
// }
//
// export { MapField }
