import fields = foundry.data.fields
import { getNewAttributeId } from "@util"
import { gid } from "@module/data/constants.ts"
import { SheetSettings } from "../sheet-settings.ts"
import { ActorGURPS2 } from "@module/documents/actor.ts"

export const RESERVED_IDS: string[] = [gid.Skill, gid.Parry, gid.Block, gid.Dodge, gid.SizeModifier, gid.Ten]

abstract class AbstractAttributeDef<
	TSchema extends AbstractAttributeDefSchema = AbstractAttributeDefSchema,
> extends foundry.abstract.DataModel<SheetSettings, TSchema> {
	// declare parent: TActor

	// protected _id: string
	// static attributeClass: typeof AbstractAttribute = AbstractAttribute

	// constructor(data?: DeepPartial<SourceFromSchema<TSchema>>, options?: DataModelConstructionOptions<TActor>) {
	// 	super(data, options)
	// 	this._id = sanitizeId(String(data?.id ?? ""), false, RESERVED_IDS)
	// }

	static override defineSchema(): AbstractAttributeDefSchema {
		const fields = foundry.data.fields

		return {
			id: new fields.StringField(),
			base: new fields.StringField(),
		}
	}

	// get id(): string {
	// 	return this._id
	// }
	//
	// set id(value: string) {
	// 	this._id = sanitizeId(value, false, RESERVED_IDS)
	// }

	get actor(): ActorGURPS2 {
		return this.parent.parent.parent
	}

	abstract baseValue(resolver: unknown): number

	// abstract generateNewAttribute(): AbstractAttribute

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

interface AbstractAttributeDef<TSchema extends AbstractAttributeDefSchema>
	extends foundry.abstract.DataModel<SheetSettings, TSchema>,
		ModelPropsFromSchema<AbstractAttributeDefSchema> {}

type AbstractAttributeDefSchema = {
	id: fields.StringField<string, string, true, false>
	base: fields.StringField<string, string, true, false, true>
}

export { AbstractAttributeDef, type AbstractAttributeDefSchema }
