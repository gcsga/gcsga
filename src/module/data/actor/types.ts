import { ActorType } from "../constants.ts"
import * as ActorInstance from "./index.ts"
import * as ActorDataTemplate from "./templates/index.ts"

export interface ActorDataInstances {
	[ActorType.Character]: ActorInstance.CharacterDataGURPS
	[ActorType.LegacyCharacter]: ActorInstance.LegacyCharacterData
	// [ActorType.LegacyEnemy]: ActorInstance.LegacyCharacterData
	[ActorType.Loot]: ActorInstance.LootData
}

export enum ActorTemplateType {
	Settings = "SettingsHolderTemplate",
	Features = "FeatureHolderTemplate",
	Attributes = "AttributeHolderTemplate",
}

export interface ActorDataTemplates {
	[ActorTemplateType.Settings]: ActorDataTemplate.SettingsHolderTemplate
	[ActorTemplateType.Features]: ActorDataTemplate.FeatureHolderTemplate
	[ActorTemplateType.Attributes]: ActorDataTemplate.AttributeHolderTemplate
}
