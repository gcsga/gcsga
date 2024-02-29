import { difficulty } from "@util"
import { ConditionID, EFFECT_ACTION, ManeuverID, RollType } from "./constants.ts"

type SkillDifficulty = `${string}/${difficulty.Level}`

// Items
type Posture =
	| "standing"
	| ConditionID.PostureCrouch
	| ConditionID.PostureSit
	| ConditionID.PostureKneel
	| ConditionID.PostureProne
	| ConditionID.PostureCrawl

const Postures = [
	ConditionID.PostureCrouch,
	ConditionID.PostureSit,
	ConditionID.PostureKneel,
	ConditionID.PostureProne,
	ConditionID.PostureCrawl,
]

const AllManeuverIDs: ManeuverID[] = [
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

const AllPostures = [
	ConditionID.PostureProne,
	ConditionID.PostureCrouch,
	ConditionID.PostureKneel,
	ConditionID.PostureSit,
	ConditionID.PostureCrawl,
] as const
const ApplicableConditions = [
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

type EffectID = ConditionID | ManeuverID

// Rolls
type ModifierItem = RollModifier | ModifierHeader

interface RollModifierStack {
	title: string
	items: RollModifier[]
	editing?: boolean
	open?: boolean
}

interface RollModifier {
	id: string
	modifier: number
	rollType?: RollType
	max?: number
	tags?: string[]
	cost?: { id: string; value: number }
	reference?: string
	target?: boolean
}

interface ModifierHeader {
	id: string
	title: true
}

//
type ImagePath = `${string}.${ImageFileExtension}`
type ImageFileExtension = "jpg" | "jpeg" | "png" | "svg" | "webp"

// Attributes
interface AttributeEffect {
	attribute: string
	state: string
	enter: ConditionEffect[]
	leave: ConditionEffect[]
}

interface ConditionEffect {
	id: ConditionID
	action: EFFECT_ACTION
}

// Actor
interface TokenPool {
	value: number
	max: number
	min: number
}

/** The tracked schema data of actors and items */
interface NewDocumentMigrationRecord {
	version: null
	previous: null
}

interface MigratedDocumentMigrationRecord {
	version: number
	previous: {
		schema: number | null
		system?: string
		foundry?: string
	} | null
}
type MigrationRecord = NewDocumentMigrationRecord | MigratedDocumentMigrationRecord

export type {
	AttributeEffect,
	ConditionEffect,
	EffectID,
	ImagePath,
	MigratedDocumentMigrationRecord,
	MigrationRecord,
	ModifierHeader,
	ModifierItem,
	NewDocumentMigrationRecord,
	Posture,
	RollModifier,
	RollModifierStack,
	TokenPool,
	SkillDifficulty,
}

export { Postures, AllManeuverIDs, ApplicableConditions, AllPostures }
