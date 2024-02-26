import { ActorGURPS } from "@actor"
import { ConditionSource, ConditionSystemData } from "./data.ts"
import { AbstractEffectGURPS } from "@item"

class ConditionGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractEffectGURPS<TParent> {}

interface ConditionGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractEffectGURPS<TParent> {
	readonly _source: ConditionSource
	system: ConditionSystemData
}

export { ConditionGURPS }
