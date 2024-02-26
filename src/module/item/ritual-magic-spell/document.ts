import { ActorGURPS } from "@actor"
import { AbstractContainerGURPS } from "@item"
import { RitualMagicSpellSource, RitualMagicSpellSystemData } from "./data.ts"

class RitualMagicSpellGURPS<
	TParent extends ActorGURPS | null = ActorGURPS | null,
> extends AbstractContainerGURPS<TParent> {}

interface RitualMagicSpellGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends AbstractContainerGURPS<TParent> {
	readonly _source: RitualMagicSpellSource
	system: RitualMagicSpellSystemData
}

export { RitualMagicSpellGURPS }
