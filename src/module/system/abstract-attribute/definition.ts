import { RESERVED_IDS } from "@system/attribute/data.ts"
import type { Mook } from "@system/mook/index.ts"
import { getNewAttributeId, sanitizeId } from "@util"
import { AbstractAttributeDefSchema } from "./data.ts"
import { AbstractAttribute } from "./object.ts"
import { ActorDataModel } from "@module/data/abstract.ts"

// abstract class AbstractAttributeDef<
// 	TActor extends ActorGURPS | Mook = ActorGURPS | Mook,
// 	TSchema extends AbstractAttributeDefSchema = AbstractAttributeDefSchema,
// > extends foundry.abstract.DataModel<TActor, TSchema> {
abstract class AbstractAttributeDef<
	TActor extends ActorDataModel | Mook = ActorDataModel | Mook,
	TSchema extends AbstractAttributeDefSchema = AbstractAttributeDefSchema,
> extends foundry.abstract.DataModel<TActor, TSchema> {
	declare parent: TActor
	// protected declare static _schema: LaxSchemaField<AbstractAttributeDefSchema> | undefined

	private _id: string
	attributeClass = AbstractAttribute

	constructor(data: DeepPartial<SourceFromSchema<TSchema>>, options?: DataModelConstructionOptions<TActor>) {
		super(data, options)
		this._id = sanitizeId(String(data.id ?? ""), false, RESERVED_IDS)
		// this._id = data.id ?? ""
		// this.base = data.base
	}

	static override defineSchema(): AbstractAttributeDefSchema {
		const fields = foundry.data.fields

		return {
			id: new fields.StringField(),
			base: new fields.StringField(),
		}
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

	static createInstance<T extends AbstractAttributeDef>(
		this: new (source: DeepPartial<SourceFromSchema<AbstractAttributeDefSchema>>) => T,
		reservedIds: string[],
	): T {
		const id = getNewAttributeId(
			reservedIds.map(e => {
				return { id: e }
			}),
		)
		return new this({ id })
	}
}

// interface AbstractAttributeDef<TActor extends ActorGURPS | Mook, TSchema extends AbstractAttributeDefSchema>
// 	extends foundry.abstract.DataModel<TActor, TSchema>,
// 		ModelPropsFromSchema<AbstractAttributeDefSchema> {}
interface AbstractAttributeDef<TActor extends ActorDataModel | Mook, TSchema extends AbstractAttributeDefSchema>
	extends foundry.abstract.DataModel<TActor, TSchema>,
		ModelPropsFromSchema<AbstractAttributeDefSchema> {}

export { AbstractAttributeDef }
