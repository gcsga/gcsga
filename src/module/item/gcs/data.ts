import { BaseContainerSource, BaseContainerSystemData } from "@item/container/data.ts"
import { MeleeWeaponSystemData } from "@item/melee_weapon/data.ts"
import { RangedWeaponSystemData } from "@item/ranged_weapon/data.ts"
import { ItemType } from "@module/data/misc.ts"

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
	tags: string[]
	type: ItemType
	weapons?: (MeleeWeaponSystemData | RangedWeaponSystemData)[]
	calc?: ItemGCSCalcValues
}

export interface ItemGCSCalcValues {
	name: string
	indent: number
	resolved_notes?: string
}
