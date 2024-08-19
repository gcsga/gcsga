import { ItemType } from "@module/data/constants.ts"
import { ConditionSystemData } from "./condition/data.ts"
import { EffectSystemData } from "./effect/data.ts"
import { EquipmentContainerSystemData } from "./equipment-container/data.ts"
import { EquipmentModifierContainerSystemData } from "./equipment-modifier-container/data.ts"
import { EquipmentModifierSystemData } from "./equipment-modifier/data.ts"
import { EquipmentSystemData } from "./equipment/data.ts"
import { MeleeWeaponSystemData } from "./melee-weapon/data.ts"
import { NoteContainerSystemData } from "./note-container/data.ts"
import { NoteSystemData } from "./note/data.ts"
import { RangedWeaponSystemData } from "./ranged-weapon/data.ts"
import { RitualMagicSpellSystemData } from "./ritual-magic-spell/data.ts"
import { SkillContainerSystemData } from "./skill-container/data.ts"
import { SkillSystemData } from "./skill/data.ts"
import { SpellContainerSystemData } from "./spell-container/data.ts"
import { SpellSystemData } from "./spell/data.ts"
import { TechniqueSystemData } from "./technique/data.ts"
import { TraitContainerSystemData } from "./trait-container/data.ts"
import { TraitModifierContainerSystemData } from "./trait-modifier-container/data.ts"
import { TraitModifierSystemData } from "./trait-modifier/data.ts"
import { TraitSystemData } from "./trait/data.ts"

// Base
export * from "./base/document.ts"

// Abstract
export { AbstractContainerGURPS } from "./abstract-container/document.ts"
export { AbstractEffectGURPS } from "./abstract-effect/document.ts"
export { AbstractSkillGURPS } from "./abstract-skill/document.ts"
export { AbstractWeaponGURPS } from "./abstract-weapon/document.ts"

// Traits
export { TraitGURPS } from "./trait/document.ts"
export { TraitContainerGURPS } from "./trait-container/document.ts"
export { TraitModifierGURPS } from "./trait-modifier/document.ts"
export { TraitModifierContainerGURPS } from "./trait-modifier-container/document.ts"

// Skills
export { SkillGURPS } from "./skill/document.ts"
export { TechniqueGURPS } from "./technique/document.ts"
export { SkillContainerGURPS } from "./skill-container/document.ts"

// Spells
export { SpellGURPS } from "./spell/document.ts"
export { RitualMagicSpellGURPS } from "./ritual-magic-spell/document.ts"
export { SpellContainerGURPS } from "./spell-container/document.ts"

// Equipment
export { EquipmentGURPS } from "./equipment/document.ts"
export { EquipmentContainerGURPS } from "./equipment-container/document.ts"
export { EquipmentModifierGURPS } from "./equipment-modifier/document.ts"
export { EquipmentModifierContainerGURPS } from "./equipment-modifier-container/document.ts"

// Notes
export { NoteGURPS } from "./note/document.ts"
export { NoteContainerGURPS } from "./note-container/document.ts"

// Weapons
export { MeleeWeaponGURPS } from "./melee-weapon/document.ts"
export { RangedWeaponGURPS } from "./ranged-weapon/document.ts"

// Weapons
export { EffectGURPS } from "./effect/document.ts"
export { ConditionGURPS } from "./condition/document.ts"

// Legacy
export { LegacyItemGURPS } from "./legacy/document.ts"

export const ItemSystemData = {
	[ItemType.Trait]: TraitSystemData,
	[ItemType.TraitContainer]: TraitContainerSystemData,
	[ItemType.TraitModifier]: TraitModifierSystemData,
	[ItemType.TraitModifierContainer]: TraitModifierContainerSystemData,
	[ItemType.Skill]: SkillSystemData,
	[ItemType.Technique]: TechniqueSystemData,
	[ItemType.SkillContainer]: SkillContainerSystemData,
	[ItemType.Spell]: SpellSystemData,
	[ItemType.RitualMagicSpell]: RitualMagicSpellSystemData,
	[ItemType.SpellContainer]: SpellContainerSystemData,
	[ItemType.Equipment]: EquipmentSystemData,
	[ItemType.EquipmentContainer]: EquipmentContainerSystemData,
	[ItemType.EquipmentModifier]: EquipmentModifierSystemData,
	[ItemType.EquipmentModifierContainer]: EquipmentModifierContainerSystemData,
	[ItemType.Note]: NoteSystemData,
	[ItemType.NoteContainer]: NoteContainerSystemData,
	// [ItemType.LegacyItem]: LegacyItemSystemData,
	[ItemType.Effect]: EffectSystemData,
	[ItemType.Condition]: ConditionSystemData,
	[ItemType.MeleeWeapon]: MeleeWeaponSystemData,
	[ItemType.RangedWeapon]: RangedWeaponSystemData,
}
