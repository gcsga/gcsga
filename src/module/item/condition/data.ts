import {
	AbstractEffectSource,
	AbstractEffectSystemData,
	AbstractEffectSystemSource,
} from "@item/abstract-effect/data.ts"
import { ItemType } from "@module/data/constants.ts"
import { RollModifier } from "@module/data/types.ts"

type ConditionSource = AbstractEffectSource<ItemType.Condition, ConditionSystemSource>

export interface Consequence {
	// id: ConditionID
	margin: number
}

interface ConditionSystemSource extends AbstractEffectSystemSource {
	slug: string | null
	sub_type: ConditionSubtype
	checks: RollModifier[]
	consequences: Consequence[]
}

enum ConditionSubtype {
	Normal = "normal",
	Posture = "posture",
}

const AllConditionSubtypes = [ConditionSubtype.Normal, ConditionSubtype.Posture]

interface ConditionSystemData extends ConditionSystemSource, Omit<AbstractEffectSystemData, "id"> {}

export type { ConditionSource, ConditionSystemData, ConditionSystemSource }

export { ConditionSubtype, AllConditionSubtypes }
