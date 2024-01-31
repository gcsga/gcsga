import { BaseItemSourceGURPS } from "@item/data.ts"
import { EffectSystemData } from "@item/effect/data.ts"
import { ItemType } from "@item/types.ts"
import { RollModifier } from "@module/data/misc.ts"

export enum ConditionID {
	// Posture
	PostureCrouch = "posture_crouch",
	PostureKneel = "posture_kneel",
	PostureSit = "posture_sit",
	PostureCrawl = "posture_crawl",
	PostureProne = "posture_prone",
	// Serious Damage
	Reeling = "reeling",
	Fatigued = "fatigued",
	Crippled = "crippled",
	Bleeding = "bleeding",
	Dead = "dead",
	// Shock / Unconsciousness
	Shock = "shock",
	Pain = "pain",
	Unconscious = "unconscious",
	Sleeping = "sleeping",
	Coma = "coma",
	// Confusion ?
	Stun = "stun",
	MentalStun = "mental_stun",
	Poisoned = "poisoned",
	Burning = "burning",
	Cold = "cold",
	// Movement Bad
	Disarmed = "disarmed",
	Falling = "falling",
	Grappled = "grappled",
	Restrained = "restrained",
	Pinned = "pinned",
	// Stealth / Movement Good
	Sprinting = "sprinting",
	Flying = "flying",
	Stealth = "stealth",
	Waiting = "waiting",
	Invisible = "invisible",
	// Afflictions
	Coughing = "coughing",
	Retching = "retching",
	Nausea = "nausea",
	Agony = "agony",
	Seizure = "seizure",
	// Disabled Function
	Blinded = "blind", // Inconsistency here between "blinded" and "blind" to match foundry default name
	Deafened = "deafened",
	Silenced = "silenced",
	Choking = "choking",
	HeartAttack = "heart_attack",
	// Drunk-adjacent
	Euphoria = "euphoria",
	Hallucinating = "hallucinating",
	Drunk = "drunk",
	Drowsy = "drowsy",
	Daze = "daze",
	// ConditionTrigger -- this is a special condition that is used to trigger other effects.
	Trigger = "trigger",
}

export type Posture =
	| "standing"
	| ConditionID.PostureCrouch
	| ConditionID.PostureSit
	| ConditionID.PostureKneel
	| ConditionID.PostureProne
	| ConditionID.PostureCrawl

export const Postures = [
	ConditionID.PostureCrouch,
	ConditionID.PostureSit,
	ConditionID.PostureKneel,
	ConditionID.PostureProne,
	ConditionID.PostureCrawl,
]

export enum ManeuverID {
	// Row 1
	DoNothing = "do_nothing",
	Attack = "attack",
	AOA = "aoa",
	AOD = "aod",
	// Row 2
	Move = "move",
	MoveAndAttack = "move_attack",
	AOADouble = "aoa_double",
	AODDouble = "aod_double",
	// Row 3
	ChangePosture = "change_posture",
	Feint = "feint",
	AOAFeint = "aoa_feint",
	AODDodge = "aod_dodge",
	// Row 4
	Ready = "ready",
	Evaluate = "evaluate",
	AOADetermined = "aoa_determined",
	AODParry = "aod_parry",
	// Row 5
	Concentrate = "concentrate",
	Aiming = "aiming",
	AOAStrong = "aoa_strong",
	AODBlock = "aod_block",
	// Row 6
	Wait = "wait",
	BLANK_1 = "blank_1",
	AOASF = "aoa_suppressing_fire",
	BLANK_2 = "blank_2",
}

export const AllManeuverIDs: ManeuverID[] = [
	ManeuverID.DoNothing,
	ManeuverID.Attack,
	ManeuverID.AOA,
	ManeuverID.AOD,
	ManeuverID.Move,
	ManeuverID.MoveAndAttack,
	ManeuverID.AOADouble,
	ManeuverID.AODDouble,
	ManeuverID.ChangePosture,
	ManeuverID.Feint,
	ManeuverID.AOAFeint,
	ManeuverID.AODDodge,
	ManeuverID.Ready,
	ManeuverID.Evaluate,
	ManeuverID.AOADetermined,
	ManeuverID.AODParry,
	ManeuverID.Concentrate,
	ManeuverID.Aiming,
	ManeuverID.AOAStrong,
	ManeuverID.AODBlock,
	ManeuverID.Wait,
	ManeuverID.AOASF,
]

export const AllPostures = [
	ConditionID.PostureProne,
	ConditionID.PostureCrouch,
	ConditionID.PostureKneel,
	ConditionID.PostureSit,
	ConditionID.PostureCrawl,
] as const

export const ApplicableConditions = [
	ConditionID.PostureCrouch,
	ConditionID.PostureKneel,
	ConditionID.PostureSit,
	ConditionID.PostureCrawl,
	ConditionID.PostureProne,
	ConditionID.Reeling,
	ConditionID.Fatigued,
	ConditionID.Crippled,
	ConditionID.Bleeding,
	ConditionID.Dead,
	ConditionID.Shock,
	ConditionID.Pain,
	ConditionID.Unconscious,
	ConditionID.Sleeping,
	ConditionID.Coma,
	ConditionID.Stun,
	ConditionID.MentalStun,
	ConditionID.Poisoned,
	ConditionID.Burning,
	ConditionID.Cold,
	ConditionID.Disarmed,
	ConditionID.Falling,
	ConditionID.Grappled,
	ConditionID.Restrained,
	ConditionID.Pinned,
	ConditionID.Sprinting,
	ConditionID.Flying,
	ConditionID.Stealth,
	ConditionID.Waiting,
	ConditionID.Invisible,
	ConditionID.Coughing,
	ConditionID.Retching,
	ConditionID.Nausea,
	ConditionID.Agony,
	ConditionID.Seizure,
	ConditionID.Blinded,
	ConditionID.Deafened,
	ConditionID.Silenced,
	ConditionID.Choking,
	ConditionID.HeartAttack,
	ConditionID.Euphoria,
	ConditionID.Hallucinating,
	ConditionID.Drunk,
	ConditionID.Drowsy,
	ConditionID.Daze,
]

export type EffectID = ConditionID | ManeuverID

export type ConditionSource = BaseItemSourceGURPS<ItemType.Condition, ConditionSystemSource>

export interface ConditionData extends Omit<ConditionSource, "effects">, ConditionSystemSource {
	readonly type: ConditionSource["type"]
	readonly _source: ConditionSource
}

export interface Consequence {
	id: ConditionID
	margin: number
}

export interface ConditionSystemSource extends EffectSystemData {
	id: ConditionID | ManeuverID | null
	checks: RollModifier[]
	consequences: Consequence[]
}
