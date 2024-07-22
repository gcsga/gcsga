import { type ConditionSource } from "@item/condition/data.ts"
import { type EffectSource } from "@item/effect/data.ts"
import { type EquipmentContainerSource } from "@item/equipment-container/data.ts"
import { type EquipmentModifierContainerSource } from "@item/equipment-modifier-container/data.ts"
import { type EquipmentModifierSource } from "@item/equipment-modifier/data.ts"
import { type EquipmentSource } from "@item/equipment/data.ts"
import { type LegacyItemSource } from "@item/legacy/data.ts"
import { type MeleeWeaponSource } from "@item/melee-weapon/data.ts"
import { type NoteContainerSource } from "@item/note-container/data.ts"
import { type NoteSource } from "@item/note/data.ts"
import { type RangedWeaponSource } from "@item/ranged-weapon/data.ts"
import { type RitualMagicSpellSource } from "@item/ritual-magic-spell/data.ts"
import { type SkillContainerSource } from "@item/skill-container/data.ts"
import { type SkillSource } from "@item/skill/data.ts"
import { type SpellContainerSource } from "@item/spell-container/data.ts"
import { type SpellSource } from "@item/spell/data.ts"
import { type TechniqueSource } from "@item/technique/data.ts"
import { type TraitContainerSource } from "@item/trait-container/data.ts"
import { type TraitModifierContainerSource } from "@item/trait-modifier-container/data.ts"
import { type TraitModifierSource } from "@item/trait-modifier/data.ts"
import { type TraitSource } from "@item/trait/data.ts"

type ItemSourceGURPS =
	| TraitSource
	| TraitContainerSource
	| TraitModifierSource
	| TraitModifierContainerSource
	| SkillSource
	| TechniqueSource
	| SkillContainerSource
	| SpellSource
	| RitualMagicSpellSource
	| SpellContainerSource
	| EquipmentSource
	| EquipmentContainerSource
	| EquipmentModifierSource
	| EquipmentModifierContainerSource
	| NoteSource
	| NoteContainerSource
	| MeleeWeaponSource
	| RangedWeaponSource
	| EffectSource
	| ConditionSource
	| LegacyItemSource

type ContainerSource =
	| TraitSource
	| TraitContainerSource
	| TraitModifierSource
	| TraitModifierContainerSource
	| SkillSource
	| TechniqueSource
	| SkillContainerSource
	| SpellSource
	| RitualMagicSpellSource
	| SpellContainerSource
	| EquipmentSource
	| EquipmentContainerSource
	| EquipmentModifierSource
	| EquipmentModifierContainerSource
	| NoteSource
	| NoteContainerSource

export type { ItemFlagsGURPS, ItemSystemSource, ItemSystemData } from "../base/data.ts"

export type {
	ConditionSource,
	ContainerSource,
	EffectSource,
	EquipmentContainerSource,
	EquipmentModifierContainerSource,
	EquipmentModifierSource,
	EquipmentSource,
	ItemSourceGURPS,
	MeleeWeaponSource,
	NoteContainerSource,
	NoteSource,
	RangedWeaponSource,
	RitualMagicSpellSource,
	SkillContainerSource,
	SkillSource,
	SpellContainerSource,
	SpellSource,
	TechniqueSource,
	TraitContainerSource,
	TraitModifierContainerSource,
	TraitModifierSource,
	TraitSource,
}
