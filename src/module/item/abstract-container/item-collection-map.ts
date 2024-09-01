import * as ItemInstance from "@item"
import { ItemSourceGURPS } from "@item/data/index.ts"
import { itemIsOfType } from "@item/helpers.ts"
import { ItemType } from "@module/data/constants.ts"

const itemItemSections = ["traitModifiers", "equipmentModifiers", "meleeWeapons", "rangedWeapons"] as const
type ItemItemSections = (typeof itemItemSections)[number]

class ItemItemCollectionMap {
	traitModifiers: Collection<ItemInstance.TraitModifierGURPS | ItemInstance.TraitModifierContainerGURPS>

	equipmentModifiers: Collection<ItemInstance.EquipmentModifierGURPS | ItemInstance.EquipmentModifierContainerGURPS>

	weapons: Collection<ItemInstance.MeleeWeaponGURPS | ItemInstance.RangedWeaponGURPS>
	meleeWeapons: Collection<ItemInstance.MeleeWeaponGURPS>
	rangedWeapons: Collection<ItemInstance.RangedWeaponGURPS>

	constructor(items: Collection<ItemInstance.ItemGURPS>) {
		const traitModifiers: (ItemInstance.TraitModifierGURPS | ItemInstance.TraitModifierContainerGURPS)[] =
			items.filter(item => itemIsOfType(item, ItemType.TraitModifier, ItemType.TraitModifierContainer))
		const equipmentModifiers: (
			| ItemInstance.EquipmentModifierGURPS
			| ItemInstance.EquipmentModifierContainerGURPS
		)[] = items.filter(item => itemIsOfType(item, ItemType.EquipmentModifier, ItemType.EquipmentModifierContainer))
		const meleeWeapons: ItemInstance.MeleeWeaponGURPS[] = items.filter(item =>
			itemIsOfType(item, ItemType.WeaponMelee),
		)
		const rangedWeapons: ItemInstance.RangedWeaponGURPS[] = items.filter(item =>
			itemIsOfType(item, ItemType.WeaponRanged),
		)

		this.traitModifiers = new Collection(traitModifiers.map(item => [item.id, item]))
		this.equipmentModifiers = new Collection(equipmentModifiers.map(item => [item.id, item]))
		this.weapons = new Collection([...meleeWeapons, ...rangedWeapons].map(item => [item.id, item]))
		this.meleeWeapons = new Collection(meleeWeapons.map(item => [item.id, item]))
		this.rangedWeapons = new Collection(rangedWeapons.map(item => [item.id, item]))
	}

	public getSection(data: ItemSourceGURPS): Collection<ItemInstance.ItemGURPS> | null {
		switch (data.type) {
			case ItemType.TraitModifier:
			case ItemType.TraitModifierContainer:
				return this.traitModifiers
			case ItemType.EquipmentModifier:
			case ItemType.EquipmentModifierContainer:
				return this.equipmentModifiers
			case ItemType.WeaponMelee:
				return this.meleeWeapons
			case ItemType.WeaponRanged:
				return this.rangedWeapons
			default:
				console.error(`Item of type "${data.type}" does not fit any section on this sheet`)
				return null
		}
	}

	public getSectionName(data: ItemSourceGURPS): ItemItemSections | null {
		switch (data.type) {
			case ItemType.TraitModifier:
			case ItemType.TraitModifierContainer:
				return "traitModifiers"
			case ItemType.EquipmentModifier:
			case ItemType.EquipmentModifierContainer:
				return "equipmentModifiers"
			case ItemType.WeaponMelee:
				return "meleeWeapons"
			case ItemType.WeaponRanged:
				return "rangedWeapons"
			default:
				console.error(`Item of type "${data.type}" does not fit any section on this sheet`)
				return null
		}
	}

	findCollection(id: string): Collection<ItemInstance.ItemGURPS> | null {
		for (const collection of [
			this.traitModifiers,
			this.equipmentModifiers,
			this.meleeWeapons,
			this.rangedWeapons,
		]) {
			if (collection.has(id)) return collection
		}
		return null
	}
}

export { ItemItemCollectionMap, itemItemSections }
export type { ItemItemSections }
