import * as ItemInstance from "@item"
import { itemIsOfType } from "@item/helpers.ts"
import { ItemType } from "@module/data/constants.ts"

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
			itemIsOfType(item, ItemType.RangedWeapon),
		)
		const rangedWeapons: ItemInstance.RangedWeaponGURPS[] = items.filter(item =>
			itemIsOfType(item, ItemType.RangedWeapon),
		)

		this.traitModifiers = new Collection(traitModifiers.map(item => [item.id, item]))
		this.equipmentModifiers = new Collection(equipmentModifiers.map(item => [item.id, item]))
		this.weapons = new Collection([...meleeWeapons, ...rangedWeapons].map(item => [item.id, item]))
		this.meleeWeapons = new Collection(meleeWeapons.map(item => [item.id, item]))
		this.rangedWeapons = new Collection(rangedWeapons.map(item => [item.id, item]))
	}
}

export { ItemItemCollectionMap }
