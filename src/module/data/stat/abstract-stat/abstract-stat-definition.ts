import fields = foundry.data.fields
import { getNewAttributeId } from "@util"
import { gid } from "@module/data/constants.ts"
import { ActorGURPS2 } from "@module/documents/actor.ts"
import { SheetSettings } from "@module/data/sheet-settings.ts"

export const RESERVED_IDS: string[] = [gid.Skill, gid.Parry, gid.Block, gid.Dodge, gid.SizeModifier, gid.Ten]

abstract class AbstractStatDef<TSchema extends AbstractStatDefSchema = AbstractStatDefSchema> extends foundry.abstract
	.DataModel<SheetSettings, TSchema> {
	// declare parent: TActor

	// protected _id: string
	// static attributeClass: typeof AbstractStat = AbstractStat

	// constructor(data?: DeepPartial<SourceFromSchema<TSchema>>, options?: DataModelConstructionOptions<TActor>) {
	// 	super(data, options)
	// 	this._id = sanitizeId(String(data?.id ?? ""), false, RESERVED_IDS)
	// }

	static override defineSchema(): AbstractStatDefSchema {
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

	// abstract generateNewAttribute(): AbstractStat

	static createInstance<T extends AbstractStatDef>(
		this: new (source: DeepPartial<SourceFromSchema<AbstractStatDefSchema>>) => T,
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

interface AbstractStatDef<TSchema extends AbstractStatDefSchema>
	extends foundry.abstract.DataModel<SheetSettings, TSchema>,
		ModelPropsFromSchema<AbstractStatDefSchema> {}

type AbstractStatDefSchema = {
	id: fields.StringField<string, string, true, false>
	base: fields.StringField<string, string, true, false, true>
}

export { AbstractStatDef, type AbstractStatDefSchema }
