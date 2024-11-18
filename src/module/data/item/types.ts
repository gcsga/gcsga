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
	// [ItemType.WeaponMelee]: ItemInstance.WeaponMeleeData
	// [ItemType.WeaponRanged]: ItemInstance.WeaponRangedData
}

export enum ItemTemplateType {
	Action = "ActionTemplate",
	AbstractSkill = "AbstractSkillTemplate",
	// AbstractWeapon = "AbstractWeaponTemplate",
	BasicInformation = "BasicInformationTemplate",
	Container = "ContainerTemplate",
	Default = "SkillDefaultTemplate",
	EquipmentFields = "EquipmentFieldsTemplate",
	Feature = "FeatureTemplate",
	Note = "NoteTemplate",
	Prereq = "PrereqTemplate",
	Replacement = "ReplacementTemplate",
	SpellFields = "SpellTemplate",
	Study = "StudyTemplate",
}

export interface ItemDataTemplates {
	[ItemTemplateType.Action]: ItemDataTemplate.ActionTemplate
	[ItemTemplateType.AbstractSkill]: ItemDataTemplate.AbstractSkillTemplate
	// [ItemTemplateType.AbstractWeapon]: ItemDataTemplate.AbstractWeaponTemplate
	[ItemTemplateType.BasicInformation]: ItemDataTemplate.BasicInformationTemplate
	[ItemTemplateType.Container]: ItemDataTemplate.ContainerTemplate
	[ItemTemplateType.Default]: ItemDataTemplate.SkillDefaultTemplate
	[ItemTemplateType.EquipmentFields]: ItemDataTemplate.EquipmentFieldsTemplate
	[ItemTemplateType.Feature]: ItemDataTemplate.FeatureTemplate
	[ItemTemplateType.Note]: ItemDataTemplate.NoteTemplate
	[ItemTemplateType.Prereq]: ItemDataTemplate.PrereqTemplate
	[ItemTemplateType.Replacement]: ItemDataTemplate.ReplacementTemplate
	[ItemTemplateType.SpellFields]: ItemDataTemplate.SpellTemplate
	[ItemTemplateType.Study]: ItemDataTemplate.StudyTemplate
}
