import {
	AbstractEffectSource,
	AbstractEffectSystemData,
	AbstractEffectSystemSource,
} from "@item/abstract-effect/data.ts"
import { ItemType } from "@module/data/constants.ts"

type EffectSource = AbstractEffectSource<ItemType.Effect, EffectSystemSource>

interface EffectSystemSource extends AbstractEffectSystemSource {}

interface EffectSystemData extends EffectSystemSource, AbstractEffectSystemData {}

export type { EffectSource, EffectSystemData }
