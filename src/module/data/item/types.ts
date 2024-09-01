import { ItemType } from "../constants.ts"
import * as ItemInstance from "./index.ts"
import * as ItemDataTemplate from "./templates/index.ts"

export interface ItemDataInstances {
	[ItemType.Trait]: ItemInstance.TraitData
	[ItemType.TraitContainer]: ItemInstance.TraitContainerData
	[ItemType.TraitModifier]: ItemInstance.TraitModifierData
	[ItemType.TraitModifierContainer]: ItemInstance.TraitModifierContainerData
	[ItemType.Skill]: ItemInstance.SkillData
	[ItemType.Technique]: ItemInstance.TechniqueData
	[ItemType.SkillContainer]: ItemInstance.SkillContainerData
	[ItemType.Spell]: ItemInstance.SpellData
	[ItemType.RitualMagicSpell]: ItemInstance.RitualMagicSpellData
	[ItemType.SpellContainer]: ItemInstance.SpellContainerData
	[ItemType.Equipment]: ItemInstance.EquipmentData
	[ItemType.EquipmentContainer]: ItemInstance.EquipmentContainerData
	[ItemType.EquipmentModifier]: ItemInstance.EquipmentModifierData
	[ItemType.EquipmentModifierContainer]: ItemInstance.EquipmentModifierContainerData
	[ItemType.Note]: ItemInstance.NoteData
	[ItemType.NoteContainer]: ItemInstance.NoteContainerData
	[ItemType.Effect]: ItemInstance.EffectData
	[ItemType.Condition]: ItemInstance.ConditionData
	[ItemType.WeaponMelee]: ItemInstance.WeaponMeleeData
	[ItemType.WeaponRanged]: ItemInstance.WeaponRangedData
}

// export type TraitGURPS2 = ItemGURPS2 & { type: ItemType.Trait; system: ItemInstance.TraitData }
// export type TraitContainerGURPS2 = ItemGURPS2 & {
// 	type: ItemType.TraitContainer
// 	system: ItemInstance.TraitContainerData
// }
// export type TraitModifierGURPS2 = ItemGURPS2 & { type: ItemType.TraitModifier; system: ItemInstance.TraitModifierData }
// export type TraitModifierContainerGURPS2 = ItemGURPS2 & {
// 	type: ItemType.TraitModifierContainer
// 	system: ItemInstance.TraitModifierContainerData
// }
// export type SkillGURPS2 = ItemGURPS2 & { type: ItemType.Skill; system: ItemInstance.SkillData }
// export type TechniqueGURPS2 = ItemGURPS2 & { type: ItemType.Technique; system: ItemInstance.TechniqueData }
// export type SkillContainerGURPS2 = ItemGURPS2 & {
// 	type: ItemType.SkillContainer
// 	system: ItemInstance.SkillContainerData
// }
// export type SpellGURPS2 = ItemGURPS2 & { type: ItemType.Spell; system: ItemInstance.SpellData }
// export type RitualMagicSpellGURPS2 = ItemGURPS2 & {
// 	type: ItemType.RitualMagicSpell
// 	system: ItemInstance.RitualMagicSpellData
// }
// export type SpellContainerGURPS2 = ItemGURPS2 & {
// 	type: ItemType.SpellContainer
// 	system: ItemInstance.SpellContainerData
// }
// export type EquipmentGURPS2 = ItemGURPS2 & { type: ItemType.Equipment; system: ItemInstance.EquipmentData }
// export type EquipmentContainerGURPS2 = ItemGURPS2 & {
// 	type: ItemType.EquipmentContainer
// 	system: ItemInstance.EquipmentContainerData
// }
// export type EquipmentModifierGURPS2 = ItemGURPS2 & {
// 	type: ItemType.EquipmentModifier
// 	system: ItemInstance.EquipmentModifierData
// }
// export type EquipmentModifierContainerGURPS2 = ItemGURPS2 & {
// 	type: ItemType.EquipmentModifierContainer
// 	system: ItemInstance.EquipmentModifierContainerData
// }
// export type NoteGURPS2 = ItemGURPS2 & { type: ItemType.Note; system: ItemInstance.NoteData }
// export type NoteContainerGURPS2 = ItemGURPS2 & { type: ItemType.NoteContainer; system: ItemInstance.NoteContainerData }
// export type EffectGURPS2 = ItemGURPS2 & { type: ItemType.Effect; system: ItemInstance.EffectData }
// export type ConditionGURPS2 = ItemGURPS2 & { type: ItemType.Condition; system: ItemInstance.ConditionData }
// export type WeaponMeleeGURPS2 = ItemGURPS2 & { type: ItemType.WeaponMelee; system: ItemInstance.WeaponMeleeData }
// export type WeaponRangedGURPS2 = ItemGURPS2 & { type: ItemType.WeaponRanged; system: ItemInstance.WeaponRangedData }

export enum ItemTemplateType {
	AbstractEffect = "AbstractEffectTemplate",
	AbstractSkill = "AbstractSkillTemplate",
	AbstractWeapon = "AbstractWeaponTemplate",
	Container = "ContainerTemplate",
	BasicInformation = "BasicInformationTemplate",
	Feature = "FeatureTemplate",
	Prereq = "PrereqTemplate",
	Replacement = "ReplacementTemplate",
	Study = "StudyTemplate",
}

export interface ItemDataTemplates {
	[ItemTemplateType.AbstractEffect]: ItemDataTemplate.AbstractEffectTemplate
	[ItemTemplateType.AbstractSkill]: ItemDataTemplate.AbstractSkillTemplate
	[ItemTemplateType.AbstractWeapon]: ItemDataTemplate.AbstractWeaponTemplate
	[ItemTemplateType.Container]: ItemDataTemplate.ContainerTemplate
	[ItemTemplateType.BasicInformation]: ItemDataTemplate.BasicInformationTemplate
	[ItemTemplateType.Feature]: ItemDataTemplate.FeatureTemplate
	[ItemTemplateType.Prereq]: ItemDataTemplate.PrereqTemplate
	[ItemTemplateType.Replacement]: ItemDataTemplate.ReplacementTemplate
	[ItemTemplateType.Study]: ItemDataTemplate.StudyTemplate
}
