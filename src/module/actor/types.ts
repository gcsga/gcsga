// import type * as ActorInstance from "@actor"
// import { ItemInstances } from "@item/types.ts"
// import { ActorGURPS } from "./base/document.ts"
// import { ActorType } from "@module/data/constants.ts"
// import { TokenDocumentGURPS } from "@scene"
//
// interface ActorInstances<TParent extends TokenDocumentGURPS | null> {
// 	[ActorType.Loot]: ActorInstance.LootGURPS<TParent>
// 	[ActorType.Character]: ActorInstance.CharacterGURPS<TParent>
// 	[ActorType.LegacyEnemy]: ActorInstance.LegacyCharacterGURPS<TParent>
// 	[ActorType.LegacyCharacter]: ActorInstance.LegacyCharacterGURPS<TParent>
// }
//
// type EmbeddedItemInstances<TParent extends ActorGURPS> = {
// 	[K in keyof ItemInstances<TParent>]: ItemInstances<TParent>[K][]
// }
//
// export type { EmbeddedItemInstances, ActorInstances }
