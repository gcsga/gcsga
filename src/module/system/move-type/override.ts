import { evaluateToNumber } from "@module/util/gcs/eval.ts"
import { MoveTypeOverrideConditionType, MoveTypeOverrideSchema } from "./data.ts"
import type { ActorGURPS } from "@actor"

class MoveTypeOverride extends foundry.abstract.DataModel<ActorGURPS, MoveTypeOverrideSchema> {
	// Value to check the actor against
	// condition: { type: MoveTypeOverrideConditionType; qualifier: string }
	// Overriddes the base value of the move type definition when condition is met
	// base: string

	constructor(
		data: DeepPartial<SourceFromSchema<MoveTypeOverrideSchema>>,
		options: DataModelConstructionOptions<ActorGURPS>,
	) {
		super(data, options)
		// this.condition = data.condition
		// this.base = data.base
	}

	static override defineSchema(): MoveTypeOverrideSchema {
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

	conditionMet(resolver: ActorGURPS = this.parent): boolean {
		switch (this.condition.type) {
			case MoveTypeOverrideConditionType.Skill:
				return resolver.itemCollections.skills.some(e => e.name === this.condition.qualifier)
			case MoveTypeOverrideConditionType.Trait:
				return resolver.itemCollections.traits.some(e => e.name === this.condition.qualifier)
			case MoveTypeOverrideConditionType.Condition:
				return resolver.itemCollections.conditions.some(e => e.system.id === this.condition.qualifier)
		}
	}

	baseValue(resolver: ActorGURPS): number {
		return evaluateToNumber(this.base, resolver)
	}
}

interface MoveTypeOverride
	extends foundry.abstract.DataModel<ActorGURPS, MoveTypeOverrideSchema>,
		ModelPropsFromSchema<MoveTypeOverrideSchema> {}

export { MoveTypeOverride }
