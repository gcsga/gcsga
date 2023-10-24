import { EquipmentModifierGURPS } from "@item/equipment_modifier"
import { ItemGCS } from "@item/gcs"
import { EquipmentModifierContainerData } from "./data"

export class EquipmentModifierContainerGURPS extends ItemGCS {
	readonly system!: EquipmentModifierContainerData

	get enabled(): boolean {
		return true
	}

	// Embedded Items
	get children(): Collection<EquipmentModifierGURPS | EquipmentModifierContainerGURPS> {
		return super.children as Collection<EquipmentModifierGURPS | EquipmentModifierContainerGURPS>
	}
}
