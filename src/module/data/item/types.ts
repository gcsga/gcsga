import { ItemType } from "../constants.ts"
import * as ItemInstance from "./index.ts"
import * as ItemDataTemplate from "./templates/index.ts"

export interface ItemDataInstances {
	// [ItemType.Condition]: ItemInstance.ConditionData
	// [ItemType.Effect]: ItemInstance.EffectData
	[ItemType.EquipmentContainer]: ItemInstance.EquipmentContainerData
	[ItemType.EquipmentModifierContainer]: ItemInstance.EquipmentModifierContainerData
	[ItemType.EquipmentModifier]: ItemInstance.EquipmentModifierData
	[ItemType.Equipment]: ItemInstance.EquipmentData
	[ItemType.NoteContainer]: ItemInstance.NoteContainerData
	[ItemType.Note]: ItemInstance.NoteData
	[ItemType.RitualMagicSpell]: ItemInstance.RitualMagicSpellData
	[ItemType.SkillContainer]: ItemInstance.SkillContainerData
	[ItemType.Skill]: ItemInstance.SkillData
	[ItemType.SpellContainer]: ItemInstance.SpellContainerData
	[ItemType.Spell]: ItemInstance.SpellData
	[ItemType.Technique]: ItemInstance.TechniqueData
	[ItemType.TraitContainer]: ItemInstance.TraitContainerData
	[ItemType.TraitModifierContainer]: ItemInstance.TraitModifierContainerData
	[ItemType.TraitModifier]: ItemInstance.TraitModifierData
	[ItemType.Trait]: ItemInstance.TraitData
	[ItemType.WeaponMelee]: ItemInstance.WeaponMeleeData
	[ItemType.WeaponRanged]: ItemInstance.WeaponRangedData
}

export enum ItemTemplateType {
	// AbstractEffect = "AbstractEffectTemplate",
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
	// [ItemTemplateType.AbstractEffect]: ItemDataTemplate.AbstractEffectTemplate
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
