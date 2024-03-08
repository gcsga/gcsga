const SYSTEM_NAME = "gcsga"

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

enum SSRT_SETTING {
	STANDARD = "standard",
	SIMPLIFIED = "simplified",
	TENS = "tens",
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
	Equipment = "equipment_gcs",
	EquipmentContainer = "equipment_container",
	EquipmentModifier = "eqp_modifier",
	EquipmentModifierContainer = "eqp_modifier_container",
	Note = "note",
	NoteContainer = "note_container",
	LegacyItem = "equipment",
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
	| ItemType.LegacyItem
	| ItemType.Effect
	| ItemType.Condition
	| ItemType.MeleeWeapon
	| ItemType.RangedWeapon

type EffectType = ItemType.Effect | ItemType.Condition

type WeaponType = ItemType.MeleeWeapon | ItemType.RangedWeapon

const DefaultHaver = [ItemType.Skill, ItemType.Technique, ItemType.MeleeWeapon, ItemType.RangedWeapon]

const CONTAINER_TYPES = new Set([
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
}

enum ConditionID {
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

enum ManeuverID {
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

// Actor
enum ActorType {
	Character = "character_gcs",
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
	ActorFlags,
	ActorType,
	CONTAINER_TYPES,
	ConditionID,
	DEFAULT_INITIATIVE_FORMULA,
	DefaultHaver,
	EFFECT_ACTION,
	GURPS_COMMANDS,
	HOOKS,
	ItemFlags,
	ItemType,
	ManeuverID,
	RollModifierTags,
	RollType,
	SETTINGS,
	SOCKET,
	SSRT_SETTING,
	SYSTEM_NAME,
	gid,
}

export type { ContainerType, EffectType, ItemTypes, WeaponType }
