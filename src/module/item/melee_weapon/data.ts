import { ItemType } from "@data"
import { BaseItemSourceGURPS } from "@item/base/data/system.ts"
import { BaseWeaponSystemSource } from "@item/weapon/data.ts"

export type MeleeWeaponSource = BaseItemSourceGURPS<ItemType.MeleeWeapon, MeleeWeaponSystemSource>

export interface MeleeWeaponSystemSource extends BaseWeaponSystemSource {
	reach: string
	parry: string
	block: string
}
