import { BaseItemSourceGURPS } from "@item/base"
import { ItemType } from "@module/data"
import { SkillDefault } from "@module/default"
import { stdmg } from "@util/enum"

export type BaseWeaponSource<
	TItemType extends ItemType = ItemType,
	TSystemData extends BaseWeaponSystemData = BaseWeaponSystemData,
> = BaseItemSourceGURPS<TItemType, TSystemData>

export interface WeaponDamageObj {
	type: string
	st?: stdmg.Option
	base?: string
	armor_divisor?: number
	fragmentation?: string
	fragmentation_armor_divisor?: number
	fragmentation_type?: string
	modifier_per_die?: number
}

export interface BaseWeaponSystemData {
	id: string
	type: WeaponType
	strength: string
	usage: string
	usage_notes: string
	defaults: SkillDefault[]
	damage: WeaponDamageObj
	calc?: BaseWeaonCalcValues
}

export interface BaseWeaonCalcValues {
	name: string
	usage: string
	resolved_notes: string
	level: number
	damage: string
	strength: string
	equipped: boolean
}

export type WeaponType = ItemType.MeleeWeapon | ItemType.RangedWeapon
