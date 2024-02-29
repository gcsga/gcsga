import { BaseItemSourceGURPS, ItemFlagsGURPS, ItemSystemData, ItemSystemSource } from "@item/base/data.ts"
import { ItemFlags, SYSTEM_NAME, WeaponType } from "@module/data/constants.ts"
import { SkillDefaultObj } from "@system"
import { stdmg } from "@util"

type AbstractWeaponSource<
	TType extends WeaponType,
	TSystemSource extends AbstractWeaponSystemSource = AbstractWeaponSystemSource,
> = BaseItemSourceGURPS<TType, TSystemSource> & {
	flags: DeepPartial<WeaponFlags>
}

type WeaponFlags = ItemFlagsGURPS & {
	[SYSTEM_NAME]: {
		[ItemFlags.Unready]: boolean
	}
}

interface AbstractWeaponSystemSource extends ItemSystemSource {
	type: WeaponType
	strength: string
	usage: string
	usage_notes: string
	defaults: SkillDefaultObj[]
	damage: WeaponDamageObj
}

interface AbstractWeaponSystemData extends AbstractWeaponSystemSource, ItemSystemData {}

interface WeaponDamageObj {
	type: string
	st?: stdmg.Option
	base?: string
	armor_divisor?: number
	fragmentation?: string
	fragmentation_armor_divisor?: number
	fragmentation_type?: string
	modifier_per_die?: number
}

export type { AbstractWeaponSource, AbstractWeaponSystemSource, AbstractWeaponSystemData, WeaponDamageObj, WeaponFlags }
