import { ActorGURPS } from "@actor/base.ts"
import { ItemGURPS } from "@item/base/document.ts"

// type CompendiumDocumentGURPS = ActorGURPS | ItemGURPS | JournalEntry | Macro | RollTable
type CompendiumDocumentGURPS = ActorGURPS | ItemGURPS<ActorGURPS | null>
type PackEntry = CompendiumDocumentGURPS["_source"]

export type { PackEntry }
