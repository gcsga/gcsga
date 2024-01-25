import { CharacterGURPS, StaticCharacterGURPS } from "@actor/document.ts"
import { LootGURPS } from "@actor/loot/index.ts"
import { ConditionGURPS } from "@item/condition/document.ts"
import { EffectGURPS } from "@item/effect/document.ts"
import { EquipmentContainerGURPS } from "@item/equipment/document.ts"
import { EquipmentGURPS } from "@item/equipment/index.ts"
import { EquipmentModifierGURPS } from "@item/equipment_modifier/document.ts"
import { EquipmentModifierContainerGURPS } from "@item/equipment_modifier_container/document.ts"
import { MeleeWeaponGURPS } from "@item/melee_weapon/index.ts"
import { NoteGURPS } from "@item/note/document.ts"
import { NoteContainerGURPS } from "@item/note_container/document.ts"
import { RangedWeaponGURPS } from "@item/ranged_weapon/index.ts"
import { RitualMagicSpellGURPS } from "@item/ritual_magic_spell/document.ts"
import { SkillGURPS } from "@item/skill/document.ts"
import { SkillContainerGURPS } from "@item/skill_container/document.ts"
import { SpellGURPS } from "@item/spell/document.ts"
import { SpellContainerGURPS } from "@item/spell_container/document.ts"
import { StaticItemGURPS } from "@item/static/index.ts"
import { TechniqueGURPS } from "@item/technique/document.ts"
import { TraitGURPS } from "@item/trait/document.ts"
import { TraitContainerGURPS } from "@item/trait_container/document.ts"
import { TraitModifierGURPS } from "@item/trait_modifier/document.ts"
import { TraitModifierContainerGURPS } from "@item/trait_modifier_container/document.ts"
import { ActorType, ItemType } from "@module/data/misc.ts"

export const GURPSCONFIG = {
	Actor: {
		documentClasses: {
			[ActorType.Character]: CharacterGURPS,
			[ActorType.LegacyCharacter]: StaticCharacterGURPS,
			[ActorType.LegacyEnemy]: StaticCharacterGURPS,
			[ActorType.Loot]: LootGURPS,
		},
	},

	Item: {
		documentClasses: {
			[ItemType.Trait]: TraitGURPS,
			[ItemType.TraitContainer]: TraitContainerGURPS,
			[ItemType.TraitModifier]: TraitModifierGURPS,
			[ItemType.TraitModifierContainer]: TraitModifierContainerGURPS,
			[ItemType.Skill]: SkillGURPS,
			[ItemType.Technique]: TechniqueGURPS,
			[ItemType.SkillContainer]: SkillContainerGURPS,
			[ItemType.Spell]: SpellGURPS,
			[ItemType.RitualMagicSpell]: RitualMagicSpellGURPS,
			[ItemType.SpellContainer]: SpellContainerGURPS,
			[ItemType.Equipment]: EquipmentGURPS,
			[ItemType.EquipmentContainer]: EquipmentContainerGURPS,
			[ItemType.EquipmentModifier]: EquipmentModifierGURPS,
			[ItemType.EquipmentModifierContainer]: EquipmentModifierContainerGURPS,
			[ItemType.Note]: NoteGURPS,
			[ItemType.NoteContainer]: NoteContainerGURPS,
			[ItemType.LegacyEquipment]: StaticItemGURPS,
			[ItemType.Effect]: EffectGURPS,
			[ItemType.Condition]: ConditionGURPS,
			[ItemType.MeleeWeapon]: MeleeWeaponGURPS,
			[ItemType.RangedWeapon]: RangedWeaponGURPS,
		},
	},
}
