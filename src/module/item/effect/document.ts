import { ActorGURPS } from "@actor"
import { AbstractEffectGURPS } from "@item"
import { EffectSource, EffectSystemData } from "./data.ts"

class EffectGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractEffectGURPS<TParent> {
}

interface EffectGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractEffectGURPS<TParent> {
	readonly _source: EffectSource
	system: EffectSystemData
}

export { EffectGURPS }
