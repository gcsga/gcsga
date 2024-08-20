import { ItemType } from "../constants.ts"
import * as ItemInstance from "./index.ts"

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
	[ItemType.MeleeWeapon]: ItemInstance.MeleeWeaponData
	[ItemType.RangedWeapon]: ItemInstance.RangedWeaponData
}
