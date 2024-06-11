import {
	AbstractWeaponSource,
	AbstractWeaponSystemData,
	AbstractWeaponSystemSource,
} from "@item/abstract-weapon/data.ts"
import { ItemType } from "@module/data/constants.ts"

type MeleeWeaponSource = AbstractWeaponSource<ItemType.MeleeWeapon, MeleeWeaponSystemSource>

interface MeleeWeaponSystemSource extends AbstractWeaponSystemSource {
	reach: string
	parry: string
	block: string
}

interface MeleeWeaponSystemData extends MeleeWeaponSystemSource, AbstractWeaponSystemData {}

export type { MeleeWeaponSource, MeleeWeaponSystemData, MeleeWeaponSystemSource }
