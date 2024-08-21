import { difficulty } from "@util"
import { ConditionID, EFFECT_ACTION, ManeuverID } from "./constants.ts"

enum ItemKind {
	Campaign = "C",
	ConditionalModifier = "c",
	Entity = "A",
	Equipment = "e",
	EquipmentContainer = "E",
	EquipmentModifier = "f",
	EquipmentModifierContainer = "F",
	NavigatorFavorites = "0",
	NavigatorLibrary = "1",
	NavigatorDirectory = "2",
	NavigatorFile = "3",
	Note = "n",
	NoteContainer = "N",
	RitualMagicSpell = "r",
	Session = "9",
	Skill = "s",
	SkillContainer = "S",
	Spell = "p",
	SpellContainer = "P",
	TableOfContents = "8",
	Technique = "q",
	Template = "B",
	Trait = "t",
	TraitContainer = "T",
	TraitModifier = "m",
	TraitModifierContainer = "M",
	WeaponMelee = "w",
	WeaponRanged = "W",
	Effect = "g",
	Condition = "G",
}

type SkillDifficulty = `${string}/${difficulty.Level}`
type TechniqueDifficulty = difficulty.Level.Average | difficulty.Level.Hard

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
	ManeuverID.Aim,
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
	ConditionID.Comatose,
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
	ConditionID.Stealthy,
	ConditionID.Waiting,
	ConditionID.Invisible,
	ConditionID.Coughing,
	ConditionID.Retching,
	ConditionID.Nausea,
	ConditionID.Agony,
	ConditionID.Seizure,
	ConditionID.Blind,
	ConditionID.Deafened,
	ConditionID.Silenced,
	ConditionID.Choking,
	ConditionID.HeartAttack,
	ConditionID.Euphoric,
	ConditionID.Hallucinating,
	ConditionID.Drunk,
	ConditionID.Drowsy,
	ConditionID.Dazed,
]

type EffectID = ConditionID | ManeuverID

// Rolls
// type ModifierItem = RollModifier | ModifierHeader

// interface RollModifierStack {
// 	title: string
// 	items: RollModifier[]
// 	editing?: boolean
// 	open?: boolean
// }

// interface RollModifier {
// 	id: string
// 	modifier: number
// 	rollType?: RollType
// 	max?: number
// 	tags?: string[]
// 	cost?: { id: string; value: number }
// 	reference?: string
// 	target?: boolean
// }

// interface ModifierHeader {
// 	id: string
// 	title: true
// }

//
type ImagePath = `${string}.${ImageFileExtension}`
type ImageFileExtension = "jpg" | "jpeg" | "png" | "svg" | "webp"

interface Stringer {
	formattedName: string
}

interface WeaponOwner {
	formattedName: string
	isLeveled: boolean
	currentLevel: number
	ratedStrength: number
}

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
	version: number | null
	previous: {
		schema: number | null
		system: string | null
		foundry: string | null
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
	// ModifierHeader,
	// ModifierItem,
	NewDocumentMigrationRecord,
	Posture,
	// RollModifier,
	// RollModifierStack,
	SkillDifficulty,
	Stringer,
	TechniqueDifficulty,
	TokenPool,
	WeaponOwner,
}

export { AllManeuverIDs, AllPostures, ApplicableConditions, Postures, ItemKind }
