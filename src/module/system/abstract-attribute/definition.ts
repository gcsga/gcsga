import { getNewAttributeId, sanitizeId } from "@util"
import { AbstractAttributeDefSchema, AbstractAttributeSchema } from "./data.ts"
import { ActorGURPS } from "@actor"
import { LaxSchemaField } from "@system/schema-data-fields.ts"
import { RESERVED_IDS } from "@system/attribute/data.ts"

abstract class AbstractAttributeDef<
	TSchema extends AbstractAttributeDefSchema = AbstractAttributeDefSchema,
	TActor extends ActorGURPS = ActorGURPS
> extends foundry.abstract.DataModel<TActor, TSchema> {

	protected declare static _schema: LaxSchemaField<AbstractAttributeDefSchema> | undefined

	private _id: string
	// base: string

	constructor(data: DeepPartial<SourceFromSchema<TSchema>>) {
		super(data)
		this._id = sanitizeId(String(data.id ?? ""), false, RESERVED_IDS)
		// this._id = data.id ?? ""
		// this.base = data.base
	}

	static override defineSchema(): AbstractAttributeDefSchema {
		const fields = foundry.data.fields

		return {
			id: new fields.StringField(),
			base: new fields.StringField()
		}
	}

	static override get schema(): LaxSchemaField<AbstractAttributeDefSchema> {
		if (this._schema && Object.hasOwn(this, "_schema")) return this._schema

		const schema = new LaxSchemaField(Object.freeze(this.defineSchema()))
		schema.name = this.name
		Object.defineProperty(this, "_schema", { value: schema, writable: false })

		return schema
	}

	get id(): string | null {
		return this._id
	}

	set id(value: string) {
		this._id = sanitizeId(value, false, RESERVED_IDS)
	}

	abstract baseValue(resolver: TActor): number

	generateNewAttribute(): SourceFromSchema<AbstractAttributeSchema> {
		return {
			id: this.id,
		}
	}

	static newObject(reservedIds: string[]): SourceFromSchema<AbstractAttributeDefSchema> {
		return {
			id: getNewAttributeId(
				reservedIds.map(e => {
					return { id: e }
				}),
			),
			base: "10",
		}
	}
}

interface AbstractAttributeDef<TSchema extends AbstractAttributeDefSchema, TActor extends ActorGURPS> extends foundry.abstract.DataModel<TActor, TSchema>,
	ModelPropsFromSchema<AbstractAttributeDefSchema> { }


export { AbstractAttributeDef }
