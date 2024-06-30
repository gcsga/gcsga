import { MoveTypeResolver, evaluateToNumber } from "@module/util/index.ts"
import { MoveTypeOverrideConditionType, MoveTypeOverrideSchema } from "./data.ts"


export class MoveTypeOverride {
	// Value to check the actor against
	condition: { type: MoveTypeOverrideConditionType; qualifier: string }
	// Overriddes the base value of the move type definition when condition is met
	base: string

	constructor(data: SourceFromSchema<MoveTypeOverrideSchema>) {
		this.condition = data.condition
		this.base = data.base
	}

	static defineSchema(): MoveTypeOverrideSchema {
		const fields = foundry.data.fields
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

	static newObject(): SourceFromSchema<MoveTypeOverrideSchema> {
		return {
			condition: { type: MoveTypeOverrideConditionType.Skill, qualifier: "" },
			base: "",
		}
	}
}
