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

enum ItemType {
	Trait = "trait",
	TraitContainer = "trait_container",
	TraitModifier = "modifier",
	TraitModifierContainer = "modifier_container",
	Skill = "skill",
	Technique = "technique",
	SkillContainer = "skill_container",
	Spell = "spell",
	RitualMagicSpell = "ritual_magic_spell",
	SpellContainer = "spell_container",
	Equipment = "equipment_gcs",
	EquipmentContainer = "equipment_container",
	EquipmentModifier = "eqp_modifier",
	EquipmentModifierContainer = "eqp_modifier_container",
	Note = "note",
	NoteContainer = "note_container",
	LegacyEquipment = "equipment",
	Effect = "effect",
	Condition = "condition",
	MeleeWeapon = "melee_weapon",
	RangedWeapon = "ranged_weapon",
}

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

export { ItemFlags } from "./system.ts"
export type { ItemFlagsGURPS } from "./system.ts"

export { ItemType }

export type {
	ConditionSource,
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
