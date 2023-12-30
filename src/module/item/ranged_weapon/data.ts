import { BaseWeaponSource, BaseWeaponSystemData } from "@item/weapon"
import { ItemType } from "@module/data"

export type RangedWeaponSource = BaseWeaponSource<ItemType.RangedWeapon, RangedWeaponSystemData>

export interface RangedWeaponData extends Omit<RangedWeaponSource, "effects">, RangedWeaponSystemData {
	readonly type: RangedWeaponSource["type"]
	readonly _source: RangedWeaponSource
}

export interface RangedWeaponSystemData extends BaseWeaponSystemData {
	accuracy: string
	range: string
	rate_of_fire: string
	shots: string
	bulk: string
	recoil: string
}

// export interface WeaponRange {
// 	halfDamage: number
// 	min: number
// 	max: number
// 	musclePowered: boolean
// 	inMiles: boolean
// }

// export interface WeaponROF {
// 	mode1: WeaponROFMode
// 	mode2: WeaponROFMode
// 	jet: boolean
// }

// export interface WeaponROFMode {
// 	shotsPerAttack: number
// 	secondaryProjectiles: number
// 	fullAutoOnly: boolean
// 	highCyclicControlledBursts: boolean
// }

// export interface WeaponShots {
// 	count: number
// 	inChamber: number
// 	duration: number
// 	reloadTime: number
// 	reloadTimeIsPerShot: boolean
// 	thrown: boolean
// }

// export interface WeaponBulk {
// 	normal: number
// 	giant: number
// 	retractingStock: boolean
// }

// export interface WeaponRecoil {
// 	shot: number
// 	slug: number
// }
