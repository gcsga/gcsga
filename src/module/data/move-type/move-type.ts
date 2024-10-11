import fields = foundry.data.fields
import { MoveTypeDef } from "./move-type-definition.ts"
import { AbstractAttribute, AbstractAttributeSchema } from "../abstract-attribute/index.ts"
import { ActorTemplateType } from "../actor/types.ts"
import { SheetSettings } from "../sheet-settings.ts"
import { MoveBonusType } from "../feature/move-bonus.ts"
import { ActorDataModel } from "../actor/abstract.ts"

class MoveType extends AbstractAttribute<ActorDataModel, MoveTypeSchema> {
	static override defineSchema(): MoveTypeSchema {
		const fields = foundry.data.fields
		return {
			...super.defineSchema(),
			adj: new fields.NumberField({ initial: 0 }),
		}
	}

	override get definition(): MoveTypeDef | null {
		return SheetSettings.for(this.actor).move_types.find(att => att.id === this.id) ?? null
	}

	bonus(type: MoveBonusType): number {
		if (!this.parent || !this.parent.hasTemplate(ActorTemplateType.Features)) return 0
		return this.parent.moveBonusFor(this.id, type)
	}

	// Base Move corresponding to this move type
	get base(): number {
		const def = this.definition
		if (!def) return 0
		let base = def.baseValue(this.parent)
		if (!def) return 0
		for (const override of def.overrides) {
			if (override.conditionMet(this.parent)) base = override.baseValue(this.parent)
		}
		return Math.floor(base + this.adj + this.bonus(MoveBonusType.Base))
	}

	// Enhanced Move corresponding to this move type
	get enhanced(): number {
		const def = this.definition
		if (!def) return 0
		let enhanced = def.baseValue(this.parent)
		for (const override of def.overrides) {
			if (override.conditionMet(this.parent)) {
				enhanced = override.baseValue(this.parent)
			}
		}

		enhanced = enhanced << Math.floor(this.bonus(MoveBonusType.Enhanced))
		if (this.bonus(MoveBonusType.Enhanced) % 1 >= 0.5) enhanced *= 1.5
		return enhanced
	}
}

interface MoveType extends AbstractAttribute<ActorDataModel, MoveTypeSchema>, ModelPropsFromSchema<MoveTypeSchema> {}

type MoveTypeSchema = AbstractAttributeSchema & {
	adj: fields.NumberField<number, number, true, false, true>
}
export { MoveType, type MoveTypeSchema }
