import type { ConditionSource } from "@item/condition/data.ts"
import type { EffectSource } from "@item/effect/data.ts"
import type { EquipmentSource } from "@item/equipment/data.ts"
import type { EquipmentContainerSource } from "@item/equipment_container/data.ts"
import type { EquipmentModifierSource } from "@item/equipment_modifier/data.ts"
import type { EquipmentModifierContainerSource } from "@item/equipment_modifier_container/data.ts"
import type { MeleeWeaponSource } from "@item/melee_weapon/data.ts"
import type { NoteSource } from "@item/note/data.ts"
import type { NoteContainerSource } from "@item/note_container/data.ts"
import type { RangedWeaponSource } from "@item/ranged_weapon/data.ts"
import type { RitualMagicSpellSource } from "@item/ritual_magic_spell/data.ts"
import type { SkillSource } from "@item/skill/data.ts"
import type { SkillContainerSource } from "@item/skill_container/data.ts"
import type { SpellSource } from "@item/spell/data.ts"
import type { SpellContainerSource } from "@item/spell_container/data.ts"
import type { TechniqueSource } from "@item/technique/data.ts"
import type { TraitSource } from "@item/trait/data.ts"
import type { TraitContainerSource } from "@item/trait_container/data.ts"
import type { TraitModifierSource } from "@item/trait_modifier/data.ts"
import type { TraitModifierContainerSource } from "@item/trait_modifier_container/data.ts"

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

type ItemSourceGCS =
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

export type { ItemFlagsGURPS, ItemSystemSource } from "./system.ts"

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
	ItemSourceGCS,
	TraitSource,
}
