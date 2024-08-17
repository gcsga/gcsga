import { TooltipGURPS, generateId } from "@util"
import { prereq } from "@util/enum/prereq.ts"
import { BasePrereqSchema, PrereqConstructionOptions } from "./data.ts"
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
import type { ItemGURPS } from "@item"
import { ItemType } from "@module/data/constants.ts"
import { ItemSystemModel, ItemSystemSchema } from "@item/base/schema.ts"

abstract class BasePrereq<TSchema extends BasePrereqSchema<prereq.Type> = BasePrereqSchema<prereq.Type>> extends foundry
	.abstract.DataModel<ItemGURPS | ItemSystemModel<ItemGURPS, ItemSystemSchema>, TSchema> {
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
			id: new fields.StringField({ required: true, nullable: false, blank: false, initial: generateId }),
			type: new fields.StringField({ required: true, nullable: false, blank: false, choices: prereq.Types }),
		}
	}

	get item(): ItemGURPS {
		if (this.parent instanceof ItemSystemModel) return this.parent.parent
		return this.parent
	}

	get index(): number {
		if (!this.item.isOfType(ItemType.Trait)) return -1
		return this.item.system.prereqs.findIndex(e => e.id === this.id)
	}

	constructor(data: DeepPartial<SourceFromSchema<TSchema>>, options?: PrereqConstructionOptions) {
		super(data, options)
	}

	abstract satisfied(actor: ActorGURPS, exclude: unknown, tooltip: TooltipGURPS, ...args: unknown[]): boolean

	abstract fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void
}

interface BasePrereq<TSchema extends BasePrereqSchema<prereq.Type>>
	extends foundry.abstract.DataModel<ItemGURPS | ItemSystemModel<ItemGURPS, ItemSystemSchema>, TSchema>,
		Omit<ModelPropsFromSchema<BasePrereqSchema<prereq.Type>>, "type"> {
	consturctor: typeof BasePrereq<TSchema>
}

export { BasePrereq }
