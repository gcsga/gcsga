import fields = foundry.data.fields
import {
	AbstractEffectSource,
	AbstractEffectSystemData,
	AbstractEffectSystemSchema,
} from "@item/abstract-effect/data.ts"
import { ItemType } from "@module/data/constants.ts"
import { RollModifier } from "@module/data/types.ts"
import { ConditionGURPS } from "./document.ts"

export interface Consequence {
	// id: ConditionID
	margin: number
}
enum ConditionSubtype {
	Normal = "normal",
	Posture = "posture",
}

const AllConditionSubtypes = [ConditionSubtype.Normal, ConditionSubtype.Posture]

class ConditionSystemData extends AbstractEffectSystemData<ConditionGURPS, ConditionSystemSchema> {
	static override defineSchema(): ConditionSystemSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			sub_type: new fields.StringField({ choices: AllConditionSubtypes, initial: ConditionSubtype.Normal }),
			checks: new fields.ArrayField(new fields.ObjectField<RollModifier>()),
			consequences: new fields.ArrayField(new fields.ObjectField<Consequence>()),
		}
	}
}

interface ConditionSystemData
	extends AbstractEffectSystemData<ConditionGURPS, ConditionSystemSchema>,
		ModelPropsFromSchema<ConditionSystemSchema> {}

type ConditionSystemSchema = AbstractEffectSystemSchema & {
	sub_type: fields.StringField<ConditionSubtype>
	checks: fields.ArrayField<fields.ObjectField<RollModifier>>
	consequences: fields.ArrayField<fields.ObjectField<Consequence>>
}

type ConditionSystemSource = SourceFromSchema<ConditionSystemSchema>

type ConditionSource = AbstractEffectSource<ItemType.Condition, ConditionSystemSource>

export { AllConditionSubtypes, ConditionSystemData }
export type { ConditionSource, ConditionSystemSource, ConditionSubtype }
