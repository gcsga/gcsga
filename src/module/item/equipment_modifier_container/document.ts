import { ActorGURPS } from "@actor/base.ts"
import { EquipmentModifierGURPS } from "@item/equipment_modifier/document.ts"
import { ItemGCS } from "@item/gcs/document.ts"
import { ItemType } from "@item/types.ts"

export interface EquipmentModifierContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends ItemGCS<TParent> {
	type: ItemType.EquipmentModifierContainer
}

export class EquipmentModifierContainerGURPS<
	TParent extends ActorGURPS | null = ActorGURPS | null,
> extends ItemGCS<TParent> {
	override get enabled(): boolean {
		return true
	}

	// Embedded Items
	override get children(): Collection<EquipmentModifierGURPS | EquipmentModifierContainerGURPS> {
		return super.children as Collection<EquipmentModifierGURPS | EquipmentModifierContainerGURPS>
	}
}
