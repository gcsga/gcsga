import { ItemType } from "@data"
import { BaseContainerSource } from "@item/container/data.ts"
import { ItemGCSSystemSource } from "@item/gcs/data.ts"

export type EquipmentModifierContainerSource = BaseContainerSource<
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
