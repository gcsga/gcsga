import { ItemInstances } from "@item/types.ts"
import { ActorGURPS } from "./base.ts"

enum ActorType {
	Character = "character_gcs",
	LegacyCharacter = "character",
	LegacyEnemy = "enemy",
	Loot = "loot",
	// MassCombatElement = "element",
	// Vehicle = "vehicle",
	// Merchant = "merchant",
}

type EmbeddedItemInstances<TParent extends ActorGURPS> = {
	[K in keyof ItemInstances<TParent>]: ItemInstances<TParent>[K][]
}

interface ActorModificationContextGURPS<TActor extends ActorGURPS> extends DocumentModificationContext<TActor> {
	substitutions?: boolean
}

export { ActorType }

export type { EmbeddedItemInstances, ActorModificationContextGURPS }
