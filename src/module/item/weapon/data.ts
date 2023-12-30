import { BaseItemSourceGURPS } from "@item/base"
import { ItemType } from "@module/data"
import { SkillDefault } from "@module/default"

export type BaseWeaponSource<
	TItemType extends ItemType = ItemType,
	TSystemData extends BaseWeaponSystemData = BaseWeaponSystemData,
> = BaseItemSourceGURPS<TItemType, TSystemData>

export interface WeaponDamageObj {
	type: string
	st?: stdmg
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
}

export type WeaponType = ItemType.MeleeWeapon | ItemType.RangedWeapon

export enum stdmg {
	None = "none",
	Thrust = "thr",
	LeveledThrust = "thr_leveled",
	Swing = "sw",
	LeveledSwing = "sw_leveled",
}

export enum wswitch {
	CanBlock = "can_block",
	CanParry = "can_parry",
	CloseCombat = "close_combat",
	Fencing = "fencing",
	FullAuto1 = "full_auto_1",
	FullAuto2 = "full_auto_2",
	Bipod = "bipod",
	ControlledBursts1 = "controlled_bursts_1",
	ControlledBursts2 = "controlled_bursts_2",
	Jet = "jet",
	Mounted = "mounted",
	MusclePowered = "muscle_powered",
	RangeInMiles = "range_in_miles",
	ReachChangeRequiresReady = "change_requires_ready",
	ReloadTimeIsPerShot = "reload_time_is_per_shot",
	RetractingStock = "retracting_stock",
	TwoHanded = "two_handed",
	Thrown = "thrown",
	Unbalanced = "unbalanced",
	TwoHandedAndUnreadyAfterAttack = "two_handed_unready",
	MusketRest = "musket_rest",
}
