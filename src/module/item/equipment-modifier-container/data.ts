import {
	AbstractContainerSource,
	AbstractContainerSystemData,
	AbstractContainerSystemSource,
} from "@item/abstract-container/data.ts"
import { ItemType } from "@module/data/constants.ts"

type EquipmentModifierContainerSource = AbstractContainerSource<
	ItemType.EquipmentModifierContainer,
	EquipmentModifierContainerSystemSource
>

interface EquipmentModifierContainerSystemSource extends AbstractContainerSystemSource {
	type: ItemType.EquipmentModifierContainer
	name?: string
	reference?: string
	reference_highlight?: string
	notes?: string
	vtt_notes?: string
	tags?: string[]
	open: boolean
}

interface EquipmentModifierContainerSystemData
	extends EquipmentModifierContainerSystemSource,
		AbstractContainerSystemData {}

export type {
	EquipmentModifierContainerSource,
	EquipmentModifierContainerSystemData,
	EquipmentModifierContainerSystemSource,
}
