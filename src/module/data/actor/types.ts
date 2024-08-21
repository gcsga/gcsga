import { ActorType } from "../constants.ts"
import * as ActorInstance from "./index.ts"

export interface ActorDataInstances {
	[ActorType.Character]: ActorInstance.Character
	[ActorType.LegacyCharacter]: ActorInstance.LegacyCharacter
	[ActorType.LegacyEnemy]: ActorInstance.LegacyEnemy
	[ActorType.Loot]: ActorInstance.Loot
}
