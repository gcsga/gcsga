import { ItemGCSSource, ItemGCSSystemSource } from "@item/gcs/data.ts"
import { ItemType } from "@item/types.ts"

export type EquipmentModifierContainerSource = ItemGCSSource<
	ItemType.EquipmentModifierContainer,
	EquipmentModifierContainerSystemSource
>

export interface EquipmentModifierContainerData
	extends Omit<EquipmentModifierContainerSource, "effects" | "items">,
		EquipmentModifierContainerSystemSource {
	readonly type: EquipmentModifierContainerSource["type"]
	data: EquipmentModifierContainerSystemSource
	readonly _source: EquipmentModifierContainerSource
}

export type EquipmentModifierContainerSystemSource = ItemGCSSystemSource
