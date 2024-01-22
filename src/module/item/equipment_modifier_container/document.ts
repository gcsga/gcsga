import { EquipmentModifierGURPS } from "@item/equipment_modifier"
import { ItemGCS } from "@item/gcs"
import { EquipmentModifierContainerSource } from "./data"

export class EquipmentModifierContainerGURPS extends ItemGCS<EquipmentModifierContainerSource> {
	get enabled(): boolean {
		return true
	}

	// Embedded Items
	get children(): Collection<EquipmentModifierGURPS | EquipmentModifierContainerGURPS> {
		return super.children as Collection<EquipmentModifierGURPS | EquipmentModifierContainerGURPS>
	}
}
