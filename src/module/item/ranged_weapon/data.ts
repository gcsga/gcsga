import { ItemType } from "@item/types.ts"
import { BaseWeaponSource, BaseWeaponSystemSource } from "@item/weapon/data.ts"

export type RangedWeaponSource = BaseWeaponSource<ItemType.RangedWeapon, RangedWeaponSystemSource>

export interface RangedWeaponSystemSource extends BaseWeaponSystemSource {
	accuracy: string
	range: string
	rate_of_fire: string
	shots: string
	bulk: string
	recoil: string
}
