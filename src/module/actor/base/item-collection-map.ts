// import * as ItemInstance from "@item"
// import { itemIsOfType } from "@item/helpers.ts"
// import { ItemFlags, ItemType, SYSTEM_NAME, WeaponType } from "@module/data/constants.ts"
// import EmbeddedCollection from "types/foundry/common/abstract/embedded-collection.js"
// import type { ActorGURPS } from "./document.ts"
// import { ItemSourceGURPS } from "@item/data/index.ts"
//
// const actorItemSections = [
// 	"traits",
// 	"skills",
// 	"spells",
// 	"carriedEquipment",
// 	"otherEquipment",
// 	"notes",
// 	"effects",
// ] as const
// type ActorItemSections = (typeof actorItemSections)[number]
//
// class ActorItemCollectionMap<TActor extends ActorGURPS> {
// 	traits: Collection<ItemInstance.TraitGURPS<TActor> | ItemInstance.TraitContainerGURPS<TActor>>
// 	skills: Collection<
// 		ItemInstance.SkillGURPS<TActor> | ItemInstance.TechniqueGURPS<TActor> | ItemInstance.SkillContainerGURPS<TActor>
// 	>
//
// 	spells: Collection<
// 		| ItemInstance.SpellGURPS<TActor>
// 		| ItemInstance.RitualMagicSpellGURPS<TActor>
// 		| ItemInstance.SpellContainerGURPS<TActor>
// 	>
//
// 	equipment: Collection<ItemInstance.EquipmentGURPS<TActor> | ItemInstance.EquipmentContainerGURPS<TActor>>
// 	carriedEquipment: Collection<ItemInstance.EquipmentGURPS<TActor> | ItemInstance.EquipmentContainerGURPS<TActor>>
// 	otherEquipment: Collection<ItemInstance.EquipmentGURPS<TActor> | ItemInstance.EquipmentContainerGURPS<TActor>>
// 	notes: Collection<ItemInstance.NoteGURPS<TActor> | ItemInstance.NoteContainerGURPS<TActor>>
// 	effects: Collection<ItemInstance.EffectGURPS<TActor> | ItemInstance.ConditionGURPS<TActor>>
// 	conditions: Collection<ItemInstance.ConditionGURPS<TActor>>
// 	weapons: Collection<ItemInstance.MeleeWeaponGURPS<TActor> | ItemInstance.RangedWeaponGURPS<TActor>>
// 	meleeWeapons: Collection<ItemInstance.MeleeWeaponGURPS<TActor>>
// 	rangedWeapons: Collection<ItemInstance.RangedWeaponGURPS<TActor>>
//
// 	constructor(items: EmbeddedCollection<ItemInstance.ItemGURPS<TActor>>) {
// 		const traits: (ItemInstance.TraitGURPS<TActor> | ItemInstance.TraitContainerGURPS<TActor>)[] = items.filter(
// 			item => itemIsOfType(item, ItemType.Trait, ItemType.TraitContainer),
// 		)
// 		const skills: (
// 			| ItemInstance.SkillGURPS<TActor>
// 			| ItemInstance.TechniqueGURPS<TActor>
// 			| ItemInstance.SkillContainerGURPS<TActor>
// 		)[] = items.filter(item => itemIsOfType(item, ItemType.Skill, ItemType.Technique, ItemType.SkillContainer))
// 		const spells: (
// 			| ItemInstance.SpellGURPS<TActor>
// 			| ItemInstance.RitualMagicSpellGURPS<TActor>
// 			| ItemInstance.SpellContainerGURPS<TActor>
// 		)[] = items.filter(item =>
// 			itemIsOfType(item, ItemType.Spell, ItemType.RitualMagicSpell, ItemType.SpellContainer),
// 		)
// 		const equipment: (ItemInstance.EquipmentGURPS<TActor> | ItemInstance.EquipmentContainerGURPS<TActor>)[] =
// 			items.filter(item => itemIsOfType(item, ItemType.Equipment, ItemType.EquipmentContainer))
// 		const notes: (ItemInstance.NoteGURPS<TActor> | ItemInstance.NoteContainerGURPS<TActor>)[] = items.filter(item =>
// 			itemIsOfType(item, ItemType.Note, ItemType.NoteContainer),
// 		)
// 		const meleeWeapons: ItemInstance.MeleeWeaponGURPS<TActor>[] = items.filter(item =>
// 			itemIsOfType(item, ItemType.WeaponMelee),
// 		)
// 		const rangedWeapons: ItemInstance.RangedWeaponGURPS<TActor>[] = items.filter(item =>
// 			itemIsOfType(item, ItemType.WeaponRanged),
// 		)
// 		const effects: ItemInstance.EffectGURPS<TActor>[] = items.filter(item => itemIsOfType(item, ItemType.Effect))
// 		const conditions: ItemInstance.ConditionGURPS<TActor>[] = items.filter(item =>
// 			itemIsOfType(item, ItemType.Condition),
// 		)
//
// 		this.traits = new Collection(traits.sort((a, b) => a.sort - b.sort).map(item => [item.id, item]))
// 		this.skills = new Collection(skills.sort((a, b) => a.sort - b.sort).map(item => [item.id, item]))
// 		this.spells = new Collection(spells.sort((a, b) => a.sort - b.sort).map(item => [item.id, item]))
// 		this.equipment = new Collection(equipment.sort((a, b) => a.sort - b.sort).map(item => [item.id, item]))
// 		this.carriedEquipment = new Collection(
// 			equipment
// 				.filter(item => !item.flags[SYSTEM_NAME][ItemFlags.Other])
// 				.sort((a, b) => a.sort - b.sort)
// 				.map(item => [item.id, item]),
// 		)
// 		this.otherEquipment = new Collection(
// 			equipment
// 				.filter(item => item.flags[SYSTEM_NAME][ItemFlags.Other])
// 				.sort((a, b) => a.sort - b.sort)
// 				.map(item => [item.id, item]),
// 		)
// 		this.notes = new Collection(notes.sort((a, b) => a.sort - b.sort).map(item => [item.id, item]))
// 		this.effects = new Collection(
// 			[...effects, ...conditions].sort((a, b) => a.sort - b.sort).map(item => [item.id, item]),
// 		)
// 		this.conditions = new Collection(conditions.sort((a, b) => a.sort - b.sort).map(item => [item.id, item]))
// 		this.weapons = new Collection(
// 			[...meleeWeapons, ...rangedWeapons].sort((a, b) => a.sort - b.sort).map(item => [item.id, item]),
// 		)
// 		this.meleeWeapons = new Collection(meleeWeapons.sort((a, b) => a.sort - b.sort).map(item => [item.id, item]))
// 		this.rangedWeapons = new Collection(rangedWeapons.sort((a, b) => a.sort - b.sort).map(item => [item.id, item]))
// 	}
//
// 	equippedWeapons<TType extends WeaponType | undefined>(
// 		type?: TType,
// 	): Collection<ItemInstance.MeleeWeaponGURPS<TActor> | ItemInstance.RangedWeaponGURPS<TActor>>
// 	equippedWeapons<TType extends ItemType.WeaponMelee | undefined>(
// 		type?: TType,
// 	): Collection<ItemInstance.MeleeWeaponGURPS<TActor>>
// 	equippedWeapons<TType extends ItemType.WeaponRanged | undefined>(
// 		type?: TType,
// 	): Collection<ItemInstance.RangedWeaponGURPS<TActor>>
// 	equippedWeapons<TType extends ItemType | undefined>(
// 		type?: TType,
// 	): Collection<ItemInstance.MeleeWeaponGURPS<TActor> | ItemInstance.RangedWeaponGURPS<TActor>> {
// 		if (type === ItemType.WeaponMelee)
// 			return new Collection(this.meleeWeapons.filter(item => item.equipped).map(item => [item.id, item]))
// 		if (type === ItemType.WeaponRanged)
// 			return new Collection(this.rangedWeapons.filter(item => item.equipped).map(item => [item.id, item]))
// 		return new Collection(this.weapons.filter(item => item.equipped).map(item => [item.id, item]))
// 	}
//
// 	public getSection(data: ItemSourceGURPS): Collection<ItemInstance.ItemGURPS<TActor>> | null {
// 		switch (data.type) {
// 			case ItemType.Trait:
// 			case ItemType.TraitContainer:
// 				return this.traits
// 			case ItemType.Skill:
// 			case ItemType.Technique:
// 			case ItemType.SkillContainer:
// 				return this.skills
// 			case ItemType.Spell:
// 			case ItemType.RitualMagicSpell:
// 			case ItemType.SpellContainer:
// 				return this.spells
// 			case ItemType.Equipment:
// 			case ItemType.EquipmentContainer:
// 				if (data.flags[SYSTEM_NAME]?.[ItemFlags.Other]) return this.otherEquipment
// 				return this.carriedEquipment
// 			case ItemType.Note:
// 			case ItemType.NoteContainer:
// 				return this.notes
// 			case ItemType.Effect:
// 			case ItemType.Condition:
// 				return this.effects
// 			default:
// 				console.error(`Item of type "${data.type}" does not fit any section on this sheet`)
// 				return null
// 		}
// 	}
//
// 	public getSectionName(data: ItemSourceGURPS): ActorItemSections | null {
// 		switch (data.type) {
// 			case ItemType.Trait:
// 			case ItemType.TraitContainer:
// 				return "traits"
// 			case ItemType.Skill:
// 			case ItemType.Technique:
// 			case ItemType.SkillContainer:
// 				return "skills"
// 			case ItemType.Spell:
// 			case ItemType.RitualMagicSpell:
// 			case ItemType.SpellContainer:
// 				return "spells"
// 			case ItemType.Equipment:
// 			case ItemType.EquipmentContainer:
// 				if (data.flags[SYSTEM_NAME]?.[ItemFlags.Other]) return "otherEquipment"
// 				return "carriedEquipment"
// 			case ItemType.Note:
// 			case ItemType.NoteContainer:
// 				return "notes"
// 			case ItemType.Effect:
// 			case ItemType.Condition:
// 				return "effects"
// 			default:
// 				console.error(`Item of type "${data.type}" does not fit any section on this sheet`)
// 				return null
// 		}
// 	}
//
// 	findCollection(id: string): Collection<ItemInstance.ItemGURPS<TActor>> | null {
// 		for (const collection of [
// 			this.traits,
// 			this.skills,
// 			this.spells,
// 			this.carriedEquipment,
// 			this.otherEquipment,
// 			this.notes,
// 			this.effects,
// 			this.meleeWeapons,
// 			this.rangedWeapons,
// 		]) {
// 			if (collection.has(id)) return collection
// 		}
// 		return null
// 	}
//
// 	public findStackableItem(
// 		item: ItemInstance.EquipmentGURPS | ItemSourceGURPS,
// 	): ItemInstance.EquipmentGURPS<TActor> | ItemInstance.EquipmentContainerGURPS<TActor> | null {
// 		// Prevent upstream from mutating property descriptors
// 		const testItem =
// 			item instanceof ItemInstance.ItemGURPS ? item.clone() : new ItemInstance.ItemProxyGURPS(fu.deepClone(item))
// 		if (!testItem.isOfType(ItemType.Equipment)) return null
//
// 		const stackCandidates = this.equipment.filter(i => i.isStackableWith(testItem))
// 		if (stackCandidates.length === 0) return null
// 		else if (stackCandidates.length > 1) {
// 			// Prefer stacking with unequipped items
// 			const notEquipped = stackCandidates.filter(item => !item.equipped)
// 			return notEquipped.length > 0 ? notEquipped[0] : stackCandidates[0]
// 		} else {
// 			return stackCandidates[0]
// 		}
// 	}
// }
//
// export { ActorItemCollectionMap, actorItemSections }
// export type { ActorItemSections }
