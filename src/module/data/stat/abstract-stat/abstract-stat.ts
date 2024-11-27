import fields = foundry.data.fields
import { ActorDataModel } from "@module/data/actor/abstract.ts"
import { ActorGURPS2 } from "@module/documents/actor.ts"
import { AbstractStatDef } from "./abstract-stat-definition.ts"
abstract class AbstractStat<
	TActor extends ActorDataModel = ActorDataModel,
	TSchema extends AbstractStatSchema = AbstractStatSchema,
> extends foundry.abstract.DataModel<ActorDataModel, TSchema> {
	static override defineSchema(): AbstractStatSchema {
		const fields = foundry.data.fields
		return {
			id: new fields.StringField({ required: true, nullable: false, initial: "id" }),
		}
	}
	constructor(data: DeepPartial<SourceFromSchema<TSchema>>, options?: AbstractStatConstructionOptions<TActor>) {
		super(data, options)
	}
	abstract get definition(): AbstractStatDef | null
	get actor(): ActorGURPS2 {
		return this.parent.parent
	}
	/** Effective value of the attribute, not taking into account modifiers from temporary effects */
	get max(): number {
		const def = this.definition
		if (!def) return 0
		return def.baseValue(this.actor.system)
	}
	/** Current value of the attribute, applies only to pools */
	get current(): number {
		return this.max
	}
	/** Effective value of the attribute, taking into account modifiers from temporary effects */
	get temporaryMax(): number {
		return this.max
	}
}
type AbstractStatSchema = {
	id: fields.StringField<string, string, true, false>
}
interface AbstractStatConstructionOptions<TActor extends ActorDataModel> extends DataModelConstructionOptions<TActor> {
	order?: number
}
export { AbstractStat, type AbstractStatSchema, type AbstractStatConstructionOptions }
