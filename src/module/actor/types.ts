import type * as ActorInstance from "@actor"
import { ActorGURPS } from "@actor"
import { ActorType } from "@data"
import { ItemInstances } from "@item/types.ts"
import { TokenDocumentGURPS } from "@scene/token-document/document.ts"

/** Used exclusively to resolve `ActorGURPS#isOfType` */
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

export type { EmbeddedItemInstances, ActorModificationContextGURPS, ActorInstances }
