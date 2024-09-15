import { evaluateToNumber } from "@module/util/gcs/eval.ts"
import fields = foundry.data.fields
import { ActorDataModel } from "../abstract.ts"

enum MoveTypeOverrideConditionType {
	Trait = "trait",
	Skill = "skill",
	Condition = "condition",
}

const MoveTypeOverrideConditionTypes: MoveTypeOverrideConditionType[] = [
	MoveTypeOverrideConditionType.Trait,
	MoveTypeOverrideConditionType.Skill,
	MoveTypeOverrideConditionType.Condition,
]

class MoveTypeOverride extends foundry.abstract.DataModel<ActorDataModel, MoveTypeOverrideSchema> {
	// constructor(
	// 	data: DeepPartial<SourceFromSchema<MoveTypeOverrideSchema>>,
	// 	options: DataModelConstructionOptions<ActorGURPS>,
	// ) {
	// 	super(data, options)
	// }

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

	conditionMet(resolver: ActorDataModel = this.parent): boolean {
		switch (this.condition.type) {
			case MoveTypeOverrideConditionType.Skill:
				return resolver.parent.itemCollections.skills.some(e => e.name === this.condition.qualifier)
			case MoveTypeOverrideConditionType.Trait:
				return resolver.parent.itemCollections.traits.some(e => e.name === this.condition.qualifier)
			case MoveTypeOverrideConditionType.Condition:
				return resolver.parent.itemCollections.conditions.some(e => e.system.name === this.condition.qualifier)
		}
	}

	baseValue(resolver: ActorDataModel): number {
		return evaluateToNumber(this.base, resolver)
	}
}

interface MoveTypeOverride
	extends foundry.abstract.DataModel<ActorDataModel, MoveTypeOverrideSchema>,
		ModelPropsFromSchema<MoveTypeOverrideSchema> {}

type MoveTypeOverrideSchema = {
	condition: fields.SchemaField<{
		type: fields.StringField<MoveTypeOverrideConditionType, MoveTypeOverrideConditionType, true, false, true>
		qualifier: fields.StringField
	}>
	base: fields.StringField<string, string, true, false, true>
}

export { MoveTypeOverride, type MoveTypeOverrideSchema, MoveTypeOverrideConditionType, MoveTypeOverrideConditionTypes }
