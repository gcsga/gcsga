import { ActorGURPS } from "@actor"
import { TokenDocumentGURPS } from "@scene"
import { CharacterFlags, CharacterSource, CharacterSystemData } from "./data.ts"

class CharacterGURPS<
	TParent extends TokenDocumentGURPS | null = TokenDocumentGURPS | null,
> extends ActorGURPS<TParent> {}

interface CharacterGURPS<TParent extends TokenDocumentGURPS | null = TokenDocumentGURPS | null>
	extends ActorGURPS<TParent> {
	flags: CharacterFlags
	readonly _source: CharacterSource
	system: CharacterSystemData
}

export { CharacterGURPS }
