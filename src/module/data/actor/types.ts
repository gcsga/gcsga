import { ActorType } from "../constants.ts"
import * as ActorInstance from "./index.ts"

export interface ActorDataInstances {
	[ActorType.Character]: ActorInstance.CharacterData
	[ActorType.LegacyCharacter]: ActorInstance.LegacyCharacterData
	[ActorType.LegacyEnemy]: ActorInstance.LegacyCharacterData
	[ActorType.Loot]: ActorInstance.LootData
}
