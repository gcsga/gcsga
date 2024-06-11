import { ActorGURPS } from "@actor"
import { TokenDocumentGURPS } from "@scene"
import { LegacyCharacterFlags, LegacyCharacterSource, LegacyCharacterSystemData } from "./data.ts"

class LegacyCharacterGURPS<
	TParent extends TokenDocumentGURPS | null = TokenDocumentGURPS | null,
> extends ActorGURPS<TParent> {}

interface LegacyCharacterGURPS<TParent extends TokenDocumentGURPS | null = TokenDocumentGURPS | null>
	extends ActorGURPS<TParent> {
	flags: LegacyCharacterFlags
	readonly _source: LegacyCharacterSource
	system: LegacyCharacterSystemData
}

export { LegacyCharacterGURPS }
