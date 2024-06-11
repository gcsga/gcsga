import type { ActorGURPS } from "@actor"
import type { ItemGURPS } from "@item"
// import type { MacroGURPS } from "@module/macro.ts"

type CompendiumDocumentGURPS = ActorGURPS | ItemGURPS<ActorGURPS | null> | JournalEntry | Macro | RollTable
type PackEntry = CompendiumDocumentGURPS["_source"]

export type { PackEntry }
