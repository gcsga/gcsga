import { ActorGURPS } from "@actor"
import { TokenDocumentGURPS } from "@scene"
import { LootFlags, LootSource, LootSystemData } from "./data.ts"

class LootGURPS<TParent extends TokenDocumentGURPS | null = TokenDocumentGURPS | null> extends ActorGURPS<TParent> {}

interface LootGURPS<TParent extends TokenDocumentGURPS | null = TokenDocumentGURPS | null> extends ActorGURPS<TParent> {
	flags: LootFlags
	readonly _source: LootSource
	system: LootSystemData
}

export { LootGURPS }
