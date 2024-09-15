// import { ActorGURPS } from "@actor"
// import { AbstractContainerGURPS } from "@item"
// import { EquipmentModifierContainerSource, EquipmentModifierContainerSystemData } from "./data.ts"
// import { ItemInstances } from "@item/types.ts"
// import { ItemType } from "@module/data/constants.ts"
//
// class EquipmentModifierContainerGURPS<
// 	TParent extends ActorGURPS | null = ActorGURPS | null,
// > extends AbstractContainerGURPS<TParent> {
// 	get children(): Collection<
// 		ItemInstances<TParent>[ItemType.EquipmentModifier] | ItemInstances<TParent>[ItemType.EquipmentModifierContainer]
// 	> {
// 		return new Collection(
// 			this.contents
// 				.filter(item => item.isOfType(ItemType.EquipmentModifier, ItemType.EquipmentModifierContainer))
// 				.map(item => [
// 					item.id,
// 					item as
// 						| ItemInstances<TParent>[ItemType.EquipmentModifier]
// 						| ItemInstances<TParent>[ItemType.EquipmentModifierContainer],
// 				]),
// 		)
// 	}
// }
//
// interface EquipmentModifierContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
// 	extends AbstractContainerGURPS<TParent> {
// 	readonly _source: EquipmentModifierContainerSource
// 	system: EquipmentModifierContainerSystemData
// }
//
// export { EquipmentModifierContainerGURPS }
