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

export enum ItemTemplateType {
	AbstractEffect = "AbstractEffectTemplate",
	AbstractSkill = "AbstractSkillTemplate",
	AbstractWeapon = "AbstractWeaponTemplate",
	Container = "ContainerTemplate",
	BasicInformation = "BasicInformationTemplate",
	Feature = "FeatureTemplate",
	Default = "SkillDefaultTemplate",
	Prereq = "PrereqTemplate",
	Replacement = "ReplacementTemplate",
	Study = "StudyTemplate",
	SpellFields = "SpellFieldsTemplate",
	EquipmentFields = "EquipmentFieldsTemplate",
}

export interface ItemDataTemplates {
	[ItemTemplateType.AbstractEffect]: ItemDataTemplate.AbstractEffectTemplate
	[ItemTemplateType.AbstractSkill]: ItemDataTemplate.AbstractSkillTemplate
	[ItemTemplateType.AbstractWeapon]: ItemDataTemplate.AbstractWeaponTemplate
	[ItemTemplateType.Container]: ItemDataTemplate.ContainerTemplate
	[ItemTemplateType.BasicInformation]: ItemDataTemplate.BasicInformationTemplate
	[ItemTemplateType.Feature]: ItemDataTemplate.FeatureTemplate
	[ItemTemplateType.Default]: ItemDataTemplate.SkillDefaultTemplate
	[ItemTemplateType.Prereq]: ItemDataTemplate.PrereqTemplate
	[ItemTemplateType.Replacement]: ItemDataTemplate.ReplacementTemplate
	[ItemTemplateType.Study]: ItemDataTemplate.StudyTemplate
	[ItemTemplateType.SpellFields]: ItemDataTemplate.SpellFieldsTemplate
	[ItemTemplateType.EquipmentFields]: ItemDataTemplate.EquipmentFieldsTemplate
}
