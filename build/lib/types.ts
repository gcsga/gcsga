import { ActorGURPS } from "@actor/base.ts"
import { ItemGURPS } from "@item"

type CompendiumDocumentGURPS = ActorGURPS | ItemGURPS<ActorGURPS | null>
type PackEntry = CompendiumDocumentGURPS["_source"]

export type { PackEntry }
