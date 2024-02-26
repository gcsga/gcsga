import { ActorGURPS } from "@actor"
import { ItemGURPS } from "@item"
import { ConditionSource, ConditionSystemData } from "@item/condition/data.ts"
import { EffectSource, EffectSystemData } from "@item/effect/data.ts"

abstract class AbstractEffectGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGURPS<TParent> {}

interface AbstractEffectGURPS<TParent extends ActorGURPS | null> extends ItemGURPS<TParent> {
	readonly _source: EffectSource | ConditionSource
	system: EffectSystemData | ConditionSystemData
}

export { AbstractEffectGURPS }
