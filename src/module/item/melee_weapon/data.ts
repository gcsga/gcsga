import { ItemType } from "@item/types.ts"
import { BaseWeaponSource, BaseWeaponSystemSource } from "@item/weapon/data.ts"

export type MeleeWeaponSource = BaseWeaponSource<ItemType.MeleeWeapon, MeleeWeaponSystemSource>

export interface MeleeWeaponSystemSource extends BaseWeaponSystemSource {
	reach: string
	parry: string
	block: string
}
