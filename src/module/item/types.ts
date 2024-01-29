import * as ItemInstance from "@item"
import { ActorGURPS } from "@actor"

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

interface ItemInstances<TParent extends ActorGURPS | null> {
	[ItemType.Trait]: ItemInstance.TraitGURPS<TParent>
	[ItemType.TraitContainer]: ItemInstance.TraitContainerGURPS<TParent>
	[ItemType.TraitModifier]: ItemInstance.TraitModifierGURPS<TParent>
	[ItemType.TraitModifierContainer]: ItemInstance.TraitModifierContainerGURPS<TParent>
	[ItemType.Skill]: ItemInstance.SkillGURPS<TParent>
	[ItemType.Technique]: ItemInstance.TechniqueGURPS<TParent>
	[ItemType.SkillContainer]: ItemInstance.SkillContainerGURPS<TParent>
	[ItemType.Spell]: ItemInstance.SpellGURPS<TParent>
	[ItemType.RitualMagicSpell]: ItemInstance.RitualMagicSpellGURPS<TParent>
	[ItemType.SpellContainer]: ItemInstance.SpellContainerGURPS<TParent>
	[ItemType.Equipment]: ItemInstance.EquipmentGURPS<TParent>
	[ItemType.EquipmentContainer]: ItemInstance.EquipmentContainerGURPS<TParent>
	[ItemType.EquipmentModifier]: ItemInstance.EquipmentModifierGURPS<TParent>
	[ItemType.EquipmentModifierContainer]: ItemInstance.EquipmentModifierContainerGURPS<TParent>
	[ItemType.Note]: ItemInstance.NoteGURPS<TParent>
	[ItemType.NoteContainer]: ItemInstance.NoteContainerGURPS<TParent>
	[ItemType.LegacyEquipment]: ItemInstance.LegacyEquipmentGURPS<TParent>
	[ItemType.Effect]: ItemInstance.EffectGURPS<TParent>
	[ItemType.Condition]: ItemInstance.ConditionGURPS<TParent>
	[ItemType.MeleeWeapon]: ItemInstance.MeleeWeaponGURPS<TParent>
	[ItemType.RangedWeapon]: ItemInstance.RangedWeaponGURPS<TParent>
}

interface ItemModificationContextGURPS<TParent extends ActorGURPS | null> extends DocumentModificationContext<TParent> {
	noPrepare?: boolean
}

export { ItemType }
export type { ItemInstances, ItemModificationContextGURPS }
