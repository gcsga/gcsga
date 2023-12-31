import { MeleeWeaponSystemData, RangedWeaponSystemData } from "@item"
import { BaseContainerSource, BaseContainerSystemData } from "@item/container"
import { ItemType } from "@module/data"

export type ItemGCSSource<
	TItemType extends ItemType = ItemType,
	TSystemData extends ItemGCSSystemData = ItemGCSSystemData,
> = BaseContainerSource<TItemType, TSystemData>

export interface ItemGCSSystemData extends BaseContainerSystemData {
	id: string
	name: string
	reference: string
	reference_highlight: string
	notes: string
	vtt_notes: string
	tags: Array<string>
	type: ItemType
	weapons?: Array<MeleeWeaponSystemData | RangedWeaponSystemData>
	calc?: ItemGCSCalcValues
}

export interface ItemGCSCalcValues {
	name: string
	indent: number
	resolved_notes?: string
}
