import * as ItemInstance from "@item"
import { itemIsOfType } from "@item/helpers.ts"
import { ItemFlags, ItemType, SYSTEM_NAME, WeaponType } from "@module/data/constants.ts"
import EmbeddedCollection from "types/foundry/common/abstract/embedded-collection.js"
import type { ActorGURPS } from "./document.ts"

class ItemCollectionMap<TActor extends ActorGURPS> {
	traits: Collection<ItemInstance.TraitGURPS<TActor> | ItemInstance.TraitContainerGURPS<TActor>>
	skills: Collection<
		ItemInstance.SkillGURPS<TActor> | ItemInstance.TechniqueGURPS<TActor> | ItemInstance.SkillContainerGURPS<TActor>
	>

	spells: Collection<
		| ItemInstance.SpellGURPS<TActor>
		| ItemInstance.RitualMagicSpellGURPS<TActor>
		| ItemInstance.SpellContainerGURPS<TActor>
	>

	equipment: Collection<ItemInstance.EquipmentGURPS<TActor> | ItemInstance.EquipmentContainerGURPS<TActor>>
	carriedEquipment: Collection<ItemInstance.EquipmentGURPS<TActor> | ItemInstance.EquipmentContainerGURPS<TActor>>
	otherEquipment: Collection<ItemInstance.EquipmentGURPS<TActor> | ItemInstance.EquipmentContainerGURPS<TActor>>
	notes: Collection<ItemInstance.NoteGURPS<TActor> | ItemInstance.NoteContainerGURPS<TActor>>
	effects: Collection<ItemInstance.EffectGURPS<TActor> | ItemInstance.ConditionGURPS<TActor>>
	conditions: Collection<ItemInstance.ConditionGURPS<TActor>>
	weapons: Collection<ItemInstance.MeleeWeaponGURPS<TActor> | ItemInstance.RangedWeaponGURPS<TActor>>
	meleeWeapons: Collection<ItemInstance.MeleeWeaponGURPS<TActor>>
	rangedWeapons: Collection<ItemInstance.RangedWeaponGURPS<TActor>>

	constructor(items: EmbeddedCollection<ItemInstance.ItemGURPS<TActor>>) {
		const traits: (ItemInstance.TraitGURPS<TActor> | ItemInstance.TraitContainerGURPS<TActor>)[] = items.filter(
			item => itemIsOfType(item, ItemType.Trait, ItemType.TraitContainer),
		)
		const skills: (
			| ItemInstance.SkillGURPS<TActor>
			| ItemInstance.TechniqueGURPS<TActor>
			| ItemInstance.SkillContainerGURPS<TActor>
		)[] = items.filter(item => itemIsOfType(item, ItemType.Skill, ItemType.Technique, ItemType.SkillContainer))
		const spells: (
			| ItemInstance.SpellGURPS<TActor>
			| ItemInstance.RitualMagicSpellGURPS<TActor>
			| ItemInstance.SpellContainerGURPS<TActor>
		)[] = items.filter(item =>
			itemIsOfType(item, ItemType.Spell, ItemType.RitualMagicSpell, ItemType.SpellContainer),
		)
		const equipment: (ItemInstance.EquipmentGURPS<TActor> | ItemInstance.EquipmentContainerGURPS<TActor>)[] =
			items.filter(item => itemIsOfType(item, ItemType.Equipment, ItemType.EquipmentContainer))
		const notes: (ItemInstance.NoteGURPS<TActor> | ItemInstance.NoteContainerGURPS<TActor>)[] = items.filter(item =>
			itemIsOfType(item, ItemType.Note, ItemType.NoteContainer),
		)
		const meleeWeapons: ItemInstance.MeleeWeaponGURPS<TActor>[] = items.filter(item =>
			itemIsOfType(item, ItemType.RangedWeapon),
		)
		const rangedWeapons: ItemInstance.RangedWeaponGURPS<TActor>[] = items.filter(item =>
			itemIsOfType(item, ItemType.RangedWeapon),
		)
		const effects: ItemInstance.EffectGURPS<TActor>[] = items.filter(item => itemIsOfType(item, ItemType.Effect))
		const conditions: ItemInstance.ConditionGURPS<TActor>[] = items.filter(item =>
			itemIsOfType(item, ItemType.Condition),
		)

		this.traits = new Collection(traits.map(item => [item.id, item]))
		this.skills = new Collection(skills.map(item => [item.id, item]))
		this.spells = new Collection(spells.map(item => [item.id, item]))
		this.equipment = new Collection(equipment.map(item => [item.id, item]))
		this.carriedEquipment = new Collection(
			equipment.filter(item => !item.flags[SYSTEM_NAME][ItemFlags.Other]).map(item => [item.id, item]),
		)
		this.otherEquipment = new Collection(
			equipment.filter(item => item.flags[SYSTEM_NAME][ItemFlags.Other]).map(item => [item.id, item]),
		)
		this.notes = new Collection(notes.map(item => [item.id, item]))
		this.effects = new Collection([...effects, ...conditions].map(item => [item.id, item]))
		this.conditions = new Collection(conditions.map(item => [item.id, item]))
		this.weapons = new Collection([...meleeWeapons, ...rangedWeapons].map(item => [item.id, item]))
		this.meleeWeapons = new Collection(meleeWeapons.map(item => [item.id, item]))
		this.rangedWeapons = new Collection(rangedWeapons.map(item => [item.id, item]))
	}

	equippedWeapons<TType extends WeaponType | undefined>(
		type?: TType,
	): Collection<ItemInstance.MeleeWeaponGURPS<TActor> | ItemInstance.RangedWeaponGURPS<TActor>>
	equippedWeapons<TType extends ItemType.MeleeWeapon | undefined>(
		type?: TType,
	): Collection<ItemInstance.MeleeWeaponGURPS<TActor>>
	equippedWeapons<TType extends ItemType.RangedWeapon | undefined>(
		type?: TType,
	): Collection<ItemInstance.RangedWeaponGURPS<TActor>>
	equippedWeapons<TType extends ItemType | undefined>(
		type?: TType,
	): Collection<ItemInstance.MeleeWeaponGURPS<TActor> | ItemInstance.RangedWeaponGURPS<TActor>> {
		if (type === ItemType.MeleeWeapon)
			return new Collection(this.meleeWeapons.filter(item => item.equipped).map(item => [item.id, item]))
		if (type === ItemType.RangedWeapon)
			return new Collection(this.rangedWeapons.filter(item => item.equipped).map(item => [item.id, item]))
		return new Collection(this.weapons.filter(item => item.equipped).map(item => [item.id, item]))
	}
}

export { ItemCollectionMap }
