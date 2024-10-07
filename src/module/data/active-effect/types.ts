import { EffectType } from "../constants.ts"
import * as EffectInstance from "./index.ts"

export interface EffectDataInstances {
	[EffectType.Effect]: EffectInstance.EffectData
	[EffectType.Condition]: EffectInstance.ConditionData
}
