import { TooltipGURPS } from "@util"
import { prereq } from "@util/enum/prereq.ts"
import { BasePrereqSchema, PrereqConstructionOptions } from "./data.ts"
import type { ItemGURPS } from "@item"
import type { ActorGURPS } from "@actor"
import {
	AttributePrereq,
	ContainedQuantityPrereq,
	ContainedWeightPrereq,
	EquippedEquipmentPrereq,
	Prereq,
	PrereqList,
	SkillPrereq,
	SpellPrereq,
	TraitPrereq,
} from "./index.ts"

abstract class BasePrereq<TSchema extends BasePrereqSchema<prereq.Type> = BasePrereqSchema<prereq.Type>> extends foundry
	.abstract.DataModel<ItemGURPS, TSchema> {
	// protected declare static _schema: LaxSchemaField<BasePrereqSchema<prereq.Type>> | undefined

	static get TYPES(): Record<prereq.Type, ConstructorOf<Prereq>> {
		return (BasePrereq.#TYPES ??= Object.freeze({
			[prereq.Type.List]: PrereqList,
			[prereq.Type.Trait]: TraitPrereq,
			[prereq.Type.Attribute]: AttributePrereq,
			[prereq.Type.ContainedQuantity]: ContainedQuantityPrereq,
			[prereq.Type.ContainedWeight]: ContainedWeightPrereq,
			[prereq.Type.EquippedEquipment]: EquippedEquipmentPrereq,
			[prereq.Type.Skill]: SkillPrereq,
			[prereq.Type.Spell]: SpellPrereq,
		}))
	}

	static #TYPES: any

	static override defineSchema(): BasePrereqSchema<prereq.Type> {
		const fields = foundry.data.fields

		return {
			type: new fields.StringField({ initial: prereq.Type.Attribute }),
		}
	}

	// static override get schema(): LaxSchemaField<BasePrereqSchema<prereq.Type>> {
	// 	if (this._schema && Object.hasOwn(this, "_schema")) return this._schema
	//
	// 	const schema = new LaxSchemaField(Object.freeze(this.defineSchema()))
	// 	schema.name = this.name
	// 	Object.defineProperty(this, "_schema", { value: schema, writable: false })
	//
	// 	return schema
	// }

	constructor(data: DeepPartial<SourceFromSchema<TSchema>>, options?: PrereqConstructionOptions) {
		super(data, options)
	}

	abstract satisfied(actor: ActorGURPS, exclude: unknown, tooltip: TooltipGURPS, ...args: unknown[]): boolean

	abstract fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void
}

export { BasePrereq }
