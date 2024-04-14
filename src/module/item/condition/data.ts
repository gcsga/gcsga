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
	// id: ConditionID | ManeuverID
	checks: RollModifier[]
	consequences: Consequence[]
}

interface ConditionSystemData extends ConditionSystemSource, Omit<AbstractEffectSystemData, "id"> {}

export type { ConditionSource, ConditionSystemData, ConditionSystemSource }
