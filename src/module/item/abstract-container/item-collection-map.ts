import type { ActorGURPS } from "@actor"
import * as ItemInstance from "@item"
import { itemIsOfType } from "@item/helpers.ts"
import { ItemType } from "@module/data/constants.ts"

class ItemItemCollectionMap<TActor extends ActorGURPS> {
	traitModifiers: Collection<
		ItemInstance.TraitModifierGURPS<TActor> | ItemInstance.TraitModifierContainerGURPS<TActor>
	>

	equipmentModifiers: Collection<
		ItemInstance.EquipmentModifierGURPS<TActor> | ItemInstance.EquipmentModifierContainerGURPS<TActor>
	>

	weapons: Collection<ItemInstance.MeleeWeaponGURPS<TActor> | ItemInstance.RangedWeaponGURPS<TActor>>
	meleeWeapons: Collection<ItemInstance.MeleeWeaponGURPS<TActor>>
	rangedWeapons: Collection<ItemInstance.RangedWeaponGURPS<TActor>>

	constructor(items: Collection<ItemInstance.ItemGURPS<TActor>>) {
		const traitModifiers: (
			| ItemInstance.TraitModifierGURPS<TActor>
			| ItemInstance.TraitModifierContainerGURPS<TActor>
		)[] = items.filter(item => itemIsOfType(item, ItemType.TraitModifier, ItemType.TraitModifierContainer))
		const equipmentModifiers: (
			| ItemInstance.EquipmentModifierGURPS<TActor>
			| ItemInstance.EquipmentModifierContainerGURPS<TActor>
		)[] = items.filter(item => itemIsOfType(item, ItemType.EquipmentModifier, ItemType.EquipmentModifierContainer))
		const meleeWeapons: ItemInstance.MeleeWeaponGURPS<TActor>[] = items.filter(item =>
			itemIsOfType(item, ItemType.RangedWeapon),
		)
		const rangedWeapons: ItemInstance.RangedWeaponGURPS<TActor>[] = items.filter(item =>
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
