import { evaluateToNumber } from "@module/util/gcs/eval.ts"
import fields = foundry.data.fields
import { EffectType } from "../constants.ts"
import { ActorDataModel } from "../actor/abstract.ts"

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

export const OverrideChoices: Readonly<Record<MoveTypeOverrideConditionType, string>> = Object.freeze({
	[MoveTypeOverrideConditionType.Trait]: `GURPS.Enum.MoveTypeOverrideConditionType.Trait`,
	[MoveTypeOverrideConditionType.Skill]: `GURPS.Enum.MoveTypeOverrideConditionType.Skill`,
	[MoveTypeOverrideConditionType.Condition]: `GURPS.Enum.MoveTypeOverrideConditionType.Condition`,
})

class MoveTypeOverride extends foundry.abstract.DataModel<ActorDataModel, MoveTypeOverrideSchema> {
	static override defineSchema(): MoveTypeOverrideSchema {
		const fields = foundry.data.fields
		return {
			condition: new fields.SchemaField({
				type: new fields.StringField<MoveTypeOverrideConditionType, MoveTypeOverrideConditionType, true>({
					required: true,
					nullable: false,
					initial: MoveTypeOverrideConditionType.Trait,
					choices: OverrideChoices,
					label: "GURPS.MoveType.Override.FIELDS.Type.Name",
				}),
				qualifier: new fields.StringField({
					required: true,
					nullable: false,
					initial: "",
					label: "GURPS.MoveType.Override.FIELDS.Qualifier.Name",
				}),
			}),
			base: new fields.StringField({
				required: true,
				nullable: false,
				initial: "$base_move",
				label: "GURPS.MoveType.Override.FIELDS.Base.Name",
			}),
		}
	}

	conditionMet(resolver: ActorDataModel = this.parent): boolean {
		switch (this.condition.type) {
			case MoveTypeOverrideConditionType.Skill:
				return resolver.parent.itemCollections.skills.some(e => e.name === this.condition.qualifier)
			case MoveTypeOverrideConditionType.Trait:
				return resolver.parent.itemCollections.traits.some(e => e.name === this.condition.qualifier)
			case MoveTypeOverrideConditionType.Condition:
				return resolver.parent.effects.some(
					e => e.isOfType(EffectType.Condition) && e.name === this.condition.qualifier,
				)
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
		qualifier: fields.StringField<string, string, true, false, true>
	}>
	base: fields.StringField<string, string, true, false, true>
}

export { MoveTypeOverride, type MoveTypeOverrideSchema, MoveTypeOverrideConditionType, MoveTypeOverrideConditionTypes }
