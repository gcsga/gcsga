/*
 * I had to move SETTINGS here as well, because it fixed the weird error that leads to the code not recognizing standard
 * foundry classes and methods.
 *
 * I propose that the "correct" way to deal with settings is to create our own settings class, where we expose methods
 * to retrieve the settings, and then no one has to know the existence of either SYSTEM_NAME or a SETTINGS value.
 * Something like this:
 *
 * In gurps.ts:
 *   import { SettingsGURPS } from "my/new/module"
 *
 *   window.GURPS.settings = new SettingsGURPS()
 *
 * Wherever you want a setting's value:
 *
 *  const value = GURPS.settings.getDefaultBodyPlan()
 */
export const SYSTEM_NAME = "gcsga"

export enum SETTINGS {
	BASIC_SET_PDF = "basic_set_pdf",
	SERVER_SIDE_FILE_DIALOG = "server_side_file_dialog",
	PORTRAIT_OVERWRITE = "portrait_overwrite",
	COMPENDIUM_BROWSER_PACKS = "compendium_browser_packs",
	COMPENDIUM_BROWSER_SOURCES = "compendium_browser_sources",
	COMPENDIUM_SKILL_DEFAULTS = "compendium_skill_defaults",
	SHOW_TOKEN_MODIFIERS = "enable_token_modifier_window",
	IGNORE_IMPORT_NAME = "ignore_import_name",
	STATIC_IMPORT_HP_FP = "import_hp_fp",
	STATIC_IMPORT_BODY_PLAN = "import_bodyplan",
	STATIC_AUTOMATICALLY_SET_IGNOREQTY = "auto-ignore-qty",
	// MODIFIER_MODE = "modifier_mode",
	COLORS = "colors",
	SHOW_IMPORT_BUTTON = "show_import_button",
	DEFAULT_ATTRIBUTES = "default_attributes",
	DAMAGE_TYPES = "damage_types",
	DEFAULT_RESOURCE_TRACKERS = "default_resource_trackers",
	DEFAULT_HIT_LOCATIONS = "default_hit_locations",
	DEFAULT_SHEET_SETTINGS = "default_sheet_settings",
	DEFAULT_MOVE_TYPES = "default_move_types",
	ROLL_MODIFIERS = "roll_modifiers",
	DEFAULT_DAMAGE_LOCATION = "default_damage_location",
	SSRT = "ssrt",
	ROLL_FORMULA = "roll_formula",
	INITIATIVE_FORMULA = "initiative_formula",
	MODIFIER_LIST_COLLAPSE = "modifier_list_collapse",
	BASE_BOOKS = "base_books",
	AUTOMATIC_UNREADY = "automatic_unready",
	WORLD_SCHEMA_VERSION = "world_schema_version",
}

export enum SSRT_SETTING {
	STANDARD = "standard",
	SIMPLIFIED = "simplified",
	TENS = "tens",
}

export enum EFFECT_ACTION {
	ADD = "add",
	REMOVE = "remove",
}

export enum SOCKET {
	INITIATIVE_CHANGED = "initiative_changed",
	UPDATE_BUCKET = "update_bucket",
}

export const DEFAULT_INITIATIVE_FORMULA = (): string => {
	return "$basic_speed+($dx/10000)+(1d6/100000)"
}

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

// export enum DisplayMode {
// 	NotShown = "not_shown",
// 	Inline = "inline",
// 	Tooltip = "tooltip",
// 	InlineAndTooltip = "inline_and_tooltip",
// }

// export enum DamageProgression {
// 	BasicSet = "basic_set",
// 	KnowingYourOwnStrength = "knowing_your_own_strength",
// 	NoSchoolGrognardDamage = "no_school_grognard_damage",
// 	ThrustEqualsSwingMinus2 = "thrust_equals_swing_minus_2",
// 	SwingEqualsThrustPlus2 = "swing_equals_thrust_plus_2",
// 	PhoenixFlameD3 = "phoenix_flame_d3",
// 	Tbone1 = "tbone_1",
// 	Tbone1Clean = "tbone_1_clean",
// 	Tbone2 = "tbone_2",
// 	Tbone2Clean = "tbone_2_clean",
// }

// export interface StringCriteria {
// 	compare: StringCompareType
// 	qualifier?: string
// }

// export enum StringCompareType {
// 	AnyString = "none",
// 	IsString = "is",
// 	IsNotString = "is_not",
// 	ContainsString = "contains",
// 	DoesNotContainString = "does_not_contain",
// 	StartsWithString = "starts_with",
// 	DoesNotStartWithString = "does_not_start_with",
// 	EndsWithString = "ends_with",
// 	DoesNotEndWithString = "does_not_end_with",
// }

// export interface NumericCriteria {
// 	compare: NumericComparisonType
// 	qualifier?: number
// }

// export interface WeightCriteria {
// 	compare: NumericComparisonType
// 	qualifier?: string
// }

// export enum NumericComparisonType {
// 	AnyNumber = "none",
// 	EqualsNumber = "is",
// 	NotEqualsNumber = "is_not",
// 	AtLeastNumber = "at_least",
// 	AtMostNumber = "at_most",
// }

// Standard attribute related ids
export enum gid {
	All = "all",
	BasicMove = "basic_move",
	BasicSpeed = "basic_speed",
	Block = "block",
	ConditionalModifier = "conditional_modifier",
	Dexterity = "dx",
	Dodge = "dodge",
	Equipment = "equipment",
	EquipmentModifier = "equipment_modifier",
	FatiguePoints = "fp",
	FrightCheck = "fright_check",
	Health = "ht",
	Hearing = "hearing",
	HitPoints = "hp",
	Intelligence = "iq",
	Note = "note",
	Parry = "parry",
	Perception = "per",
	ReactionModifier = "reaction_modifier",
	RitualMagicSpell = "ritual_magic_spell",
	SizeModifier = "sm",
	Skill = "skill",
	Spell = "spell",
	Strength = "st",
	TasteSmell = "taste_smell",
	Technique = "technique",
	Ten = "10",
	Torso = "torso",
	Touch = "touch",
	Trait = "trait",
	TraitModifier = "trait_modifier",
	Vision = "vision",
	Will = "will",
	Flexible = "flexible",
	// Damage
	Thrust = "thrust",
	Swing = "swing",
	// Move Types
	Ground = "ground",
	Water = "water",
	Air = "air",
	Space = "space",
}

export const attrPrefix = "attr."

// export enum CR {
// 	None = 0,
// 	CR6 = 6,
// 	CR9 = 9,
// 	CR12 = 12,
// 	CR15 = 15,
// }

// export enum CRAdjustment {
// 	None = "none",
// 	ActionPenalty = "action_penalty",
// 	ReactionPenalty = "reaction_penalty",
// 	FrightCheckPenalty = "fright_check_penalty",
// 	FrightCheckBonus = "fright_check_bonus",
// 	MinorCostOfLivingIncrease = "minor_cost_of_living_increase",
// 	MajorCostOfLivingIncrease = "major_cost_of_living_increase",
// }

// export enum Difficulty {
// 	Easy = "e",
// 	Average = "a",
// 	Hard = "h",
// 	VeryHard = "vh",
// 	Wildcard = "w",
// }

// export enum StudyHoursNeeded {
// 	Standard = "200",
// 	Level1 = "180",
// 	Level2 = "160",
// 	Level3 = "140",
// 	Level4 = "120",
// }

// export enum StudyType {
// 	Self = "self",
// 	Job = "job",
// 	Teacher = "teacher",
// 	Intensive = "intensive",
// }

export enum RollType {
	Attribute = "attribute",
	Skill = "skill",
	SkillRelative = "skill_rsl",
	Spell = "spell",
	SpellRelative = "spell_rsl",
	Attack = "attack",
	Parry = "parry",
	Block = "block",
	Damage = "damage",
	Modifier = "modifier",
	ControlRoll = "control_roll",
	Location = "location",
	Generic = "generic",
}

export type ModifierItem = RollModifier | ModifierHeader

export interface RollModifierStack {
	title: string
	items: RollModifier[]
	editing?: boolean
	open?: boolean
}

export interface RollModifier {
	id: string
	modifier: number
	rollType?: RollType
	max?: number
	tags?: string[]
	cost?: { id: string; value: number }
	reference?: string
	target?: boolean
}

export enum RollModifierTags {
	Range = "range",
}

export interface ModifierHeader {
	id: string
	title: true
}

export type ImagePath = `${string}.${ImageFileExtension}`
type ImageFileExtension = "jpg" | "jpeg" | "png" | "svg" | "webp"

export enum SpellSubType {
	NAME = "name",
	TAG = "tag",
	COLLEGE = "college",
	COLLEGE_COUNT = "college_count",
	ANY = "any",
}

export const GURPS_COMMANDS = (() => {
	const any = "([^]*)" // Any character, including new lines
	return {
		mook: new RegExp(`^\\/mook ?${any}`, "i"),
	}
})()

export interface Stringer {
	formattedName: string
}

export interface WeaponOwner {
	formattedName: string
	isLeveled: boolean
	currentLevel: number
	ratedStrength: number
}

export enum HOOKS_GURPS {
	AddModifier = "addModifier",
}

export type SkillDefaultType = gid.Block | gid.Parry | gid.Skill | gid.Ten | string

export interface AttributeEffect {
	attribute: string
	state: string
	enter: ConditionEffect[]
	leave: ConditionEffect[]
}

export interface ConditionEffect {
	id: ConditionID
	action: EFFECT_ACTION
}

export interface TokenPool {
	value: number
	max: number
	min: number
}

/** The tracked schema data of actors and items */
export interface NewDocumentMigrationRecord {
	version: null
	previous: null
}

export interface MigratedDocumentMigrationRecord {
	version: number
	previous: {
		schema: number | null
		system?: string
		foundry?: string
	} | null
}
export type MigrationRecord = NewDocumentMigrationRecord | MigratedDocumentMigrationRecord
