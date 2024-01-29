import { BaseItemSourceGURPS } from "@item/data.ts"
import { ItemType } from "@item/types.ts"
import { SkillDefault } from "@sytem/default/index.ts"
import { stdmg } from "@util/enum/stdmg.ts"

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
	unready: boolean
}

export type WeaponType = ItemType.MeleeWeapon | ItemType.RangedWeapon
