import { ActorGURPS } from "@actor/base.ts"
import { EquipmentModifierGURPS } from "@item/equipment_modifier/document.ts"
import { ItemGCS } from "@item/gcs/document.ts"

export class EquipmentModifierContainerGURPS<TParent extends ActorGURPS = ActorGURPS> extends ItemGCS<TParent> {
	override get enabled(): boolean {
		return true
	}

	// Embedded Items
	override get children(): Collection<EquipmentModifierGURPS | EquipmentModifierContainerGURPS> {
		return super.children as Collection<EquipmentModifierGURPS | EquipmentModifierContainerGURPS>
	}
}
