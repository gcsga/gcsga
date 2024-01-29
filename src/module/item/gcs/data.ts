import { FeatureObj } from "@feature"
import { BaseContainerSource, BaseContainerSystemData } from "@item/container/data.ts"
import { MeleeWeaponSystemData } from "@item/melee_weapon/data.ts"
import { RangedWeaponSystemData } from "@item/ranged_weapon/data.ts"
import { ItemType } from "@item/types.ts"
import { PrereqListObj } from "@prereq/data.ts"

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
	features?: FeatureObj[]
	prereqs?: PrereqListObj
}

export interface ItemGCSCalcValues {
	name: string
	indent: number
	resolved_notes?: string
}
