import { BaseWeaponSource, BaseWeaponSystemData } from "@item/weapon"
import { ItemType } from "@module/data"

export type MeleeWeaponSource = BaseWeaponSource<ItemType.MeleeWeapon, MeleeWeaponSystemData>

export interface MeleeWeaponData extends Omit<MeleeWeaponSource, "effects">, MeleeWeaponSystemData {
	readonly type: MeleeWeaponSource["type"]
	readonly _source: MeleeWeaponSource
}

export interface MeleeWeaponSystemData extends BaseWeaponSystemData {
	reach: string
	parry: string
	block: string
}

export interface WeaponParry {
	no: boolean
	fencing: boolean
	unbalanced: boolean
	modifier: number
}

export interface WeaponBlock {
	no: boolean
	modifier: number
}
