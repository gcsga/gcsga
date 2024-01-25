import { ConditionSource } from "@item/condition/data.ts"
import { EffectSource } from "@item/effect/data.ts"
import { EquipmentSource } from "@item/equipment/data.ts"
import { EquipmentContainerSource } from "@item/equipment_container/data.ts"
import { EquipmentModifierSource } from "@item/equipment_modifier/data.ts"
import { EquipmentModifierContainerSource } from "@item/equipment_modifier_container/data.ts"
import { NoteSource } from "@item/note/data.ts"
import { NoteContainerSource } from "@item/note_container/data.ts"
import { RitualMagicSpellSource } from "@item/ritual_magic_spell/data.ts"
import { SkillSource } from "@item/skill/data.ts"
import { SkillContainerSource } from "@item/skill_container/data.ts"
import { SpellSource } from "@item/spell/data.ts"
import { SpellContainerSource } from "@item/spell_container/data.ts"
import { TechniqueSource } from "@item/technique/data.ts"
import { TraitSource } from "@item/trait/data.ts"
import { TraitContainerSource } from "@item/trait_container/data.ts"
import { TraitModifierSource } from "@item/trait_modifier/data.ts"
import { TraitModifierContainerSource } from "@item/trait_modifier_container/data.ts"

export type ItemSourceGURPS =
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
	| EffectSource
	| ConditionSource
