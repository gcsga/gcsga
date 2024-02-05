import { ItemType } from "@data"
import { BaseItemSourceGURPS, ItemSystemSource } from "@item/base/data/system.ts"
import { SkillDefaultObj } from "@sytem/default/index.ts"
import { stdmg } from "@util/enum/stdmg.ts"

export type BaseWeaponSource<
	TItemType extends ItemType = ItemType,
	TSystemData extends BaseWeaponSystemSource = BaseWeaponSystemSource,
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

export interface BaseWeaponSystemSource extends ItemSystemSource {
	type: WeaponType
	strength: string
	usage: string
	usage_notes: string
	defaults: SkillDefaultObj[]
	damage: WeaponDamageObj
}
export type WeaponType = ItemType.MeleeWeapon | ItemType.RangedWeapon
