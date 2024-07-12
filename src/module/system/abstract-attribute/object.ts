import { AbstractAttributeDef } from "./definition.ts"
import { AbstractAttributeSchema } from "./data.ts"
import { ActorGURPS } from "@actor"
import { LaxSchemaField } from "@system/schema-data-fields.ts"

abstract class AbstractAttribute<
	TActor extends ActorGURPS = ActorGURPS,
	TSchema extends AbstractAttributeSchema = AbstractAttributeSchema
> extends foundry.abstract.DataModel<TActor, TSchema> {

	protected declare static _schema: LaxSchemaField<AbstractAttributeSchema> | undefined

	static override defineSchema(): AbstractAttributeSchema {
		const fields = foundry.data.fields

		return {
			id: new fields.StringField(),
		}
	}

	static override get schema(): LaxSchemaField<AbstractAttributeSchema> {
		if (this._schema && Object.hasOwn(this, "_schema")) return this._schema

		const schema = new LaxSchemaField(Object.freeze(this.defineSchema()))
		schema.name = this.name
		Object.defineProperty(this, "_schema", { value: schema, writable: false })

		return schema
	}

	// _id: string

	constructor(data: DeepPartial<SourceFromSchema<TSchema>>) {
		super(data)
		// this._id = String(data.id ?? "")
	}

	abstract get definition(): AbstractAttributeDef<TActor> | null

	// get id(): string {
	// 	return this._id
	// }

	get actor(): TActor {
		return this.parent
	}

	/** Effective value of the attribute, not taking into account modifiers from temporary effects */
	get max(): number {
		const def = this.definition
		if (!def) return 0
		return def.baseValue(this.actor)
	}

	/** Current value of the attribute, applies only to pools */
	get current(): number {
		return this.max
	}

	/** Effective value of the attribute, taking into account modifiers from temporary effects */
	get effective(): number {
		return this.max
	}
}

export { AbstractAttribute }
