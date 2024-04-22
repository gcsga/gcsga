import {
	AbstractWeaponSource,
	AbstractWeaponSystemData,
	AbstractWeaponSystemSource,
} from "@item/abstract-weapon/data.ts"
import { ItemType } from "@module/data/constants.ts"

type RangedWeaponSource = AbstractWeaponSource<ItemType.RangedWeapon, RangedWeaponSystemSource>

interface RangedWeaponSystemSource extends AbstractWeaponSystemSource {
	accuracy: string
	range: string
	rate_of_fire: string
	shots: string
	bulk: string
	recoil: string
}

interface RangedWeaponSystemData extends RangedWeaponSystemSource, AbstractWeaponSystemData {}

export type { RangedWeaponSource, RangedWeaponSystemData, RangedWeaponSystemSource }
