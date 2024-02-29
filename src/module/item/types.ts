import { ActorGURPS } from "@actor"
import { ItemType } from "@data"
import * as ItemInstance from "@item"

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
	[ItemType.LegacyItem]: ItemInstance.LegacyItemGURPS<TParent>
	[ItemType.Effect]: ItemInstance.EffectGURPS<TParent>
	[ItemType.Condition]: ItemInstance.ConditionGURPS<TParent>
	[ItemType.MeleeWeapon]: ItemInstance.MeleeWeaponGURPS<TParent>
	[ItemType.RangedWeapon]: ItemInstance.RangedWeaponGURPS<TParent>
}

export type { ItemInstances }
