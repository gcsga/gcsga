import { MoveTypeResolver, evaluateToNumber } from "@module/util/index.ts"
import { MoveTypeOverrideConditionType, MoveTypeOverrideObj } from "./data.ts"

const fields = foundry.data.fields

export type MoveTypeOverrideSchema = {
	condition: foundry.data.fields.SchemaField<{
		type: foundry.data.fields.StringField<
			MoveTypeOverrideConditionType,
			MoveTypeOverrideConditionType,
			true,
			false,
			true
		>
		qualifier: foundry.data.fields.StringField<string, string, true, false, true>
	}>
	base: foundry.data.fields.StringField<string, string, true, false, true>
}

export class MoveTypeOverride {
	// Value to check the actor against
	condition: { type: MoveTypeOverrideConditionType; qualifier: string }
	// Overriddes the base value of the move type definition when condition is met
	base: string

	constructor(data: MoveTypeOverrideObj) {
		this.condition = data.condition
		this.base = data.base
	}

	static defineSchema(): MoveTypeOverrideSchema {
		return {
			condition: new fields.SchemaField({
				type: new fields.StringField<MoveTypeOverrideConditionType, MoveTypeOverrideConditionType, true>({
					initial: MoveTypeOverrideConditionType.Trait,
				}),
				qualifier: new fields.StringField(),
			}),
			base: new fields.StringField(),
		}
	}

	conditionMet(resolver: MoveTypeResolver): boolean {
		switch (this.condition.type) {
			case MoveTypeOverrideConditionType.Skill:
				return resolver.itemCollections.skills.some(e => e.name === this.condition.qualifier)
			case MoveTypeOverrideConditionType.Trait:
				return resolver.itemCollections.traits.some(e => e.name === this.condition.qualifier)
			case MoveTypeOverrideConditionType.Condition:
				return resolver.itemCollections.conditions.some(e => e.system.id === this.condition.qualifier)
		}
	}

	baseValue(resolver: MoveTypeResolver): number {
		return evaluateToNumber(this.base, resolver)
	}

	static newObject(): MoveTypeOverrideObj {
		return {
			condition: { type: MoveTypeOverrideConditionType.Skill, qualifier: "" },
			base: "",
		}
	}
}
