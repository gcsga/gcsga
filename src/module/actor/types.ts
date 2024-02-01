import type * as ActorInstance from "@actor"
import { ItemInstances } from "@item/types.ts"
import { ActorGURPS } from "./base.ts"
import { TokenDocumentGURPS } from "@scene/token-document/document.ts"

enum ActorType {
	Character = "character_gcs",
	LegacyCharacter = "character",
	LegacyEnemy = "enemy",
	Loot = "loot",
	// MassCombatElement = "element",
	// Vehicle = "vehicle",
	// Merchant = "merchant",
}

/** Used exclusively to resolve `ActorPF2e#isOfType` */
interface ActorInstances<TParent extends TokenDocumentGURPS | null> {
	[ActorType.Character]: ActorInstance.CharacterGURPS<TParent>
	[ActorType.LegacyCharacter]: ActorInstance.StaticCharacterGURPS<TParent>
	[ActorType.LegacyEnemy]: ActorInstance.StaticCharacterGURPS<TParent>
	[ActorType.Loot]: ActorInstance.LootGURPS<TParent>
}

type EmbeddedItemInstances<TParent extends ActorGURPS> = {
	[K in keyof ItemInstances<TParent>]: ItemInstances<TParent>[K][]
}

interface ActorModificationContextGURPS<TActor extends ActorGURPS> extends DocumentModificationContext<TActor> {
	substitutions?: boolean
}

export { ActorType }

export type { EmbeddedItemInstances, ActorModificationContextGURPS, ActorInstances }
