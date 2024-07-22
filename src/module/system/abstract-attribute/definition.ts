import { getNewAttributeId, sanitizeId } from "@util"
import { AbstractAttributeDefSchema } from "./data.ts"
import { ActorGURPS } from "@actor"
import { LaxSchemaField } from "@system/schema-data-fields.ts"
import { RESERVED_IDS } from "@system/attribute/data.ts"
import { AbstractAttribute } from "@system"

abstract class AbstractAttributeDef<
	TActor extends ActorGURPS = ActorGURPS,
	TSchema extends AbstractAttributeDefSchema = AbstractAttributeDefSchema
> extends foundry.abstract.DataModel<TActor, TSchema> {

	declare parent: TActor
	protected declare static _schema: LaxSchemaField<AbstractAttributeDefSchema> | undefined

	private _id: string
	attributeClass = AbstractAttribute


	constructor(
		data: DeepPartial<SourceFromSchema<TSchema>>,
		options?: DataModelConstructionOptions<TActor>
	) {
		super(data, options)
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

	get id(): string {
		return this._id
	}

	set id(value: string) {
		this._id = sanitizeId(value, false, RESERVED_IDS)
	}

	get actor(): TActor {
		return this.parent
	}

	abstract baseValue(resolver: TActor): number

	abstract generateNewAttribute(): AbstractAttribute

	static createInstance<T extends AbstractAttributeDef>
		(this: new (source: DeepPartial<SourceFromSchema<AbstractAttributeDefSchema>>) => T, reservedIds: string[]): T {
		const id = getNewAttributeId(reservedIds.map(e => { return { id: e } }))
		return new this({ id })
	}



	// static init(reservedIds: string[], type: "attribute",): AttributeDef
	// static init(reservedIds: string[], type: "resource_tracker",): ResourceTrackerDef
	// static init(reservedIds: string[], type: "move_type",): MoveTypeDef
	// static init(reservedIds: string[], type: keyof typeof AttributeDefClasses,): AbstractAttributeDef {
	// 	const id = getNewAttributeId(reservedIds.map(e => { return { id: e } }))
	// 	const AttributeDefClass = AttributeDefClasses[type]
	// 	return new AttributeDefClass({ id })
	// }

	// generateNewAttribute(): SourceFromSchema<AbstractAttributeSchema> {
	// 	return {
	// 		id: this.id,
	// 	}
	// }
	//
	// static newObject(reservedIds: string[]): SourceFromSchema<AbstractAttributeDefSchema> {
	// 	return {
	// 		id: getNewAttributeId(
	// 			reservedIds.map(e => {
	// 				return { id: e }
	// 			}),
	// 		),
	// 		base: "10",
	// 	}
	// }
}

interface AbstractAttributeDef<
	TActor extends ActorGURPS,
	TSchema extends AbstractAttributeDefSchema
> extends foundry.abstract.DataModel<TActor, TSchema>,
	ModelPropsFromSchema<AbstractAttributeDefSchema> {
}


export { AbstractAttributeDef }
