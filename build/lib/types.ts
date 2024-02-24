import { ActorGURPS } from "@actor"
import { ItemGURPS } from "@item"

type CompendiumDocumentGURPS = ActorGURPS | ItemGURPS<ActorGURPS | null>
type PackEntry = CompendiumDocumentGURPS["_source"]

export type { PackEntry }
