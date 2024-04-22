import { CharacterSource } from "./character/data.ts"
import { LegacyCharacterSource } from "./legacy/data.ts"
import { LootSource } from "./loot/data.ts"

type ActorSourceGURPS = CharacterSource | LootSource | LegacyCharacterSource

export type { ActorSourceGURPS }
