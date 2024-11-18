import { ActiveEffectGURPS } from "@module/documents/active-effect.ts"
import fields = foundry.data.fields

class AppliedEffectField extends fields.SchemaField<AppliedEffectFieldSchema> {
	constructor(fields: Record<string, fields.DataField> = {}, options: Record<string, unknown> = {}) {
		super(
			{
				_id: new foundry.data.fields.DocumentIdField(),
				...fields,
			},
			options,
		)
	}

	/* -------------------------------------------- */

	override initialize(
		value: unknown,
		model?: ConstructorOf<foundry.abstract.DataModel>,
		options?: Record<string, unknown>,
	): ModelPropsFromSchema<AppliedEffectFieldSchema> {
		const obj = super.initialize(value, model, options)
		const item = model
		console.log(item)

		Object.defineProperty(obj, "effect", {
			get(): ActiveEffectGURPS {
				// TODO: fix
				console.log(item)
				return item?.effects.get(this._id)
			},
			configurable: true,
		})
		return obj
	}
}

type AppliedEffectFieldSchema = {
	_id: fields.DocumentIdField
}

export { AppliedEffectField }
