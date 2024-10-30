import { ActorGURPS2 } from "@module/documents/actor.ts"
import { ItemGURPS2 } from "@module/documents/item.ts"

type CompendiumDocumentGURPS = ActorGURPS2 | ItemGURPS2<null> | JournalEntry | Macro | RollTable
type PackEntry = CompendiumDocumentGURPS["_source"]

export type { PackEntry }
