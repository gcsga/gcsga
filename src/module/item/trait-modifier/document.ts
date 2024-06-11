import { ActorGURPS } from "@actor"
import { ItemGURPS } from "@item"
import { TraitModifierSource, TraitModifierSystemData } from "./data.ts"

class TraitModifierGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGURPS<TParent> {}

interface TraitModifierGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGURPS<TParent> {
	readonly _source: TraitModifierSource
	system: TraitModifierSystemData
}

export { TraitModifierGURPS }
