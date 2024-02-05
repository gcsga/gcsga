import { ItemGCSSource, ItemGCSSystemSource } from "@item/gcs/data.ts"
import { ItemType } from "@item/types.ts"

export type EquipmentModifierContainerSource = ItemGCSSource<
	ItemType.EquipmentModifierContainer,
	EquipmentModifierContainerSystemSource
>

export interface EquipmentModifierContainerSystemSource extends ItemGCSSystemSource {
	type: ItemType.EquipmentModifierContainer
	name?: string
	reference?: string
	reference_highlight?: string
	notes?: string
	vtt_notes?: string
	tags?: string[]
}
