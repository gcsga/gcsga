import Sortable from "sortablejs"

const SYSTEM_NAME = "gcsga"

enum COMPENDIA {
	CONDITIONS = "conditions",
	MANEUVERS = "maneuvers",
}

// Settings
enum SETTINGS {
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
	MANEUVER_DETAIL = "maneuver_detail",
}

enum SSRT_SETTING {
	STANDARD = "standard",
	SIMPLIFIED = "simplified",
	TENS = "tens",
}

enum MANEUVER_DETAIL_SETTING {
	FULL = "full",
	NO_FEINT = "no_feint",
	GENERAL = "general",
}

enum SOCKET {
	INITIATIVE_CHANGED = "initiative_changed",
	UPDATE_BUCKET = "update_bucket",
}

enum EFFECT_ACTION {
	ADD = "add",
	REMOVE = "remove",
}

const DEFAULT_INITIATIVE_FORMULA = (): string => {
	return "$basic_speed+($dx/10000)+(1d6/100000)"
}

// Item
enum ItemType {
	Trait = "trait",
	TraitContainer = "trait_container",
	TraitModifier = "modifier",
	TraitModifierContainer = "modifier_container",
	Skill = "skill",
	Technique = "technique",
	SkillContainer = "skill_container",
	Spell = "spell",
	RitualMagicSpell = "ritual_magic_spell",
	SpellContainer = "spell_container",
	// Equipment = "equipment_gcs",
	Equipment = "equipment",
	EquipmentContainer = "equipment_container",
	EquipmentModifier = "eqp_modifier",
	EquipmentModifierContainer = "eqp_modifier_container",
	Note = "note",
	NoteContainer = "note_container",
	// LegacyItem = "equipment",
	Effect = "effect",
	Condition = "condition",
	MeleeWeapon = "melee_weapon",
	RangedWeapon = "ranged_weapon",
}

type ItemTypes =
	| ItemType.Trait
	| ItemType.TraitContainer
	| ItemType.TraitModifier
	| ItemType.TraitModifierContainer
	| ItemType.Skill
	| ItemType.Technique
	| ItemType.SkillContainer
	| ItemType.Spell
	| ItemType.RitualMagicSpell
	| ItemType.SpellContainer
	| ItemType.Equipment
	| ItemType.EquipmentContainer
	| ItemType.EquipmentModifier
	| ItemType.EquipmentModifierContainer
	| ItemType.Note
	| ItemType.NoteContainer
	// | ItemType.LegacyItem
	| ItemType.Effect
	| ItemType.Condition
	| ItemType.MeleeWeapon
	| ItemType.RangedWeapon

type EffectType = ItemType.Effect | ItemType.Condition

type WeaponType = ItemType.MeleeWeapon | ItemType.RangedWeapon

const DefaultHaver = [ItemType.Skill, ItemType.Technique, ItemType.MeleeWeapon, ItemType.RangedWeapon]

const ABSTRACT_CONTAINER_TYPES = new Set([
	ItemType.Trait,
	ItemType.TraitContainer,
	ItemType.TraitModifierContainer,
	ItemType.Skill,
	ItemType.Technique,
	ItemType.SkillContainer,
	ItemType.Spell,
	ItemType.RitualMagicSpell,
	ItemType.SpellContainer,
	ItemType.Equipment,
	ItemType.EquipmentContainer,
	ItemType.EquipmentModifierContainer,
	ItemType.NoteContainer,
] as const)

const CONTAINER_TYPES = new Set([
	ItemType.TraitContainer,
	ItemType.TraitModifierContainer,
	ItemType.SkillContainer,
	ItemType.SpellContainer,
	ItemType.EquipmentContainer,
	ItemType.EquipmentModifierContainer,
	ItemType.NoteContainer,
] as const)

type ContainerType =
	| ItemType.Trait
	| ItemType.TraitContainer
	| ItemType.TraitModifierContainer
	| ItemType.Skill
	| ItemType.Technique
	| ItemType.SkillContainer
	| ItemType.Spell
	| ItemType.RitualMagicSpell
	| ItemType.SpellContainer
	| ItemType.Equipment
	| ItemType.EquipmentContainer
	| ItemType.EquipmentModifierContainer
	| ItemType.NoteContainer

enum ItemFlags {
	Deprecation = "deprecation",
	Container = "container",
	Other = "other", // used for equipment only
	Unready = "unready",
	Overlay = "overlay", // used for effects only
}

enum ConditionID {
	// Posture
	PostureCrouch = "crouching",
	PostureKneel = "kneeling",
	PostureSit = "sitting",
	PostureCrawl = "crawling",
	PostureProne = "prone",
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
	Comatose = "comatose",
	// Confusion ?
	Stun = "stun",
	MentalStun = "mental-stun",
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
	Stealthy = "stealthy",
	Waiting = "waiting",
	Invisible = "invisible",
	// Afflictions
	Coughing = "coughing",
	Retching = "retching",
	Nausea = "nausea",
	Agony = "agony",
	Seizure = "seizure",
	// Disabled Function
	Blind = "blind", // Inconsistency here between "blinded" and "blind" to match foundry default name
	Deafened = "deafened",
	Silenced = "silenced",
	Choking = "choking",
	HeartAttack = "heart-attack",
	// Drunk-adjacent
	Euphoric = "euphoric",
	Hallucinating = "hallucinating",
	Drunk = "drunk",
	Drowsy = "drowsy",
	Dazed = "dazed",
	// ConditionTrigger -- this is a special condition that is used to trigger other effects.
	Trigger = "trigger",
}

enum ManeuverID {
	// Row 1
	DoNothing = "do-nothing",
	Attack = "attack",
	AOA = "all-out-attack",
	AOD = "all-out-defense",
	// Row 2
	Move = "move",
	MoveAndAttack = "move-and-attack",
	AOADouble = "all-out-attack-double",
	AODDouble = "all-out-defense-double",
	// Row 3
	ChangePosture = "change-posture",
	Feint = "feint",
	AOAFeint = "all-out-attack-feint",
	AODDodge = "all-out-defense-dodge",
	// Row 4
	Ready = "ready",
	Evaluate = "evaluate",
	AOADetermined = "all-out-attack-determined",
	AODParry = "all-out-defense-parry",
	// Row 5
	Concentrate = "concentrate",
	Aim = "aim",
	AOAStrong = "all-out-attack-strong",
	AODBlock = "all-out-defense-block",
	// Row 6
	Wait = "wait",
	BLANK_1 = "blank-1",
	AOASF = "all-out-attack-suppressing-fire",
	BLANK_2 = "blank-2",
}

// Actor
enum ActorType {
	Character = "character",
	// Character = "character_gcs",
	// LegacyCharacter = "character",
	// LegacyEnemy = "enemy",
	Loot = "loot",
	// MassCombatElement = "element",
	// Vehicle = "vehicle",
	// Merchant = "merchant",
}

enum ActorFlags {
	TargetModifiers = "targetModifiers",
	SelfModifiers = "selfModifiers",
	Deprecation = "deprecation",
	MoveType = "move_type",
	AutoEncumbrance = "auto_encumbrance",
	AutoThreshold = "auto_threshold",
	AutoDamage = "auto_damage",
	Import = "import",
}

// Commonly Used Values
enum gid {
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

// Rolls
enum RollType {
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

enum RollModifierTags {
	Range = "range",
}

const GURPS_COMMANDS = (() => {
	const any = "([^]*)" // Any character, including new lines
	return {
		mook: new RegExp(`^\\/mook ?${any}`, "i"),
	}
})()

enum HOOKS {
	AddModifier = "addModifier",
}

export {
	ABSTRACT_CONTAINER_TYPES,
	ActorFlags,
	ActorType,
	COMPENDIA,
	CONTAINER_TYPES,
	ConditionID,
	DEFAULT_INITIATIVE_FORMULA,
	DefaultHaver,
	EFFECT_ACTION,
	GURPS_COMMANDS,
	HOOKS,
	ItemFlags,
	ItemType,
	MANEUVER_DETAIL_SETTING,
	ManeuverID,
	RollModifierTags,
	RollType,
	SETTINGS,
	SOCKET,
	SSRT_SETTING,
	SYSTEM_NAME,
	gid,
}

export const SORTABLE_BASE_OPTIONS: Sortable.Options = {
	animation: 200,
	direction: "vertical",
	dragClass: "drag-preview",
	dragoverBubble: true,
	easing: "cubic-bezier(1, 0, 0, 1)",
	fallbackOnBody: true,
	// filter: "div.item-summary",
	filter: "div.item-summary",
	ghostClass: "drag-gap",
	group: "inventory",
	preventOnFilter: false,
	swapThreshold: 0.25,

	// These options are from the Autoscroll plugin and serve as a fallback on mobile/safari/ie/edge
	// Other browsers use the native implementation
	scroll: true,
	scrollSensitivity: 30,
	scrollSpeed: 15,

	delay: 500,
	delayOnTouchOnly: true,
}

export type { ContainerType, EffectType, ItemTypes, WeaponType }
