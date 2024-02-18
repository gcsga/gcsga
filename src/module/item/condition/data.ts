import { ConditionID, ItemType, ManeuverID, RollModifier } from "@data"
import { BaseItemSourceGURPS } from "@item/base/data/system.ts"
import { EffectSystemSource } from "@item/effect/data.ts"

export type ConditionSource = BaseItemSourceGURPS<ItemType.Condition, ConditionSystemSource>

export interface Consequence {
	id: ConditionID
	margin: number
}

export interface ConditionSystemSource extends EffectSystemSource {
	id: ConditionID | ManeuverID | null
	checks: RollModifier[]
	consequences: Consequence[]
}
