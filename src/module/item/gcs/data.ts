import { FeatureObj } from "@feature"
import { BaseContainerSource, BaseContainerSystemData } from "@item/container/data.ts"
import { MeleeWeaponSystemSource } from "@item/melee_weapon/data.ts"
import { RangedWeaponSystemSource } from "@item/ranged_weapon/data.ts"
import { ItemType } from "@item/types.ts"
import { PrereqListObj } from "@prereq/data.ts"

export type ItemGCSSource<
	TItemType extends ItemType = ItemType,
	TSystemData extends ItemGCSSystemSource = ItemGCSSystemSource,
> = BaseContainerSource<TItemType, TSystemData>

export interface ItemGCSSystemSource extends BaseContainerSystemData {
	id: string
	name: string
	reference: string
	reference_highlight: string
	notes: string
	vtt_notes: string
	tags: string[]
	type: ItemType
	weapons?: (MeleeWeaponSystemSource | RangedWeaponSystemSource)[]
	features?: FeatureObj[]
	prereqs?: PrereqListObj
}
