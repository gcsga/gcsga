/// <reference types="vite/client" />
// import { CompendiumBrowser } from "@module/apps/compendium-browser/index.ts"
import { ModifierBucket } from "@module/apps/modifier-bucket/button.ts"
// import { ModifierList } from "@module/apps/modifier-list/document.ts"
// import { ChatLogGURPS } from "@module/apps/sidebar/chat-log.ts"
// import { CompendiumDirectoryGURPS } from "@module/apps/sidebar/compendium-directory.ts"
// import { CanvasGURPS } from "@module/canvas/index.ts"
import { ActorsGURPS } from "@module/data/collections/actors-collection.ts"
import { ItemsGURPS } from "@module/data/collections/items-collection.ts"
import { SETTINGS, SSRT_SETTING } from "@module/data/constants.ts"
import { DiceGURPS } from "@module/data/dice.ts"
import { SheetSettings } from "@module/data/sheet-settings.ts"
import { ActorGURPS2 } from "@module/document/actor.ts"
import { ChatMessageGURPS } from "@module/document/chat-message.ts"
import { CombatGURPS } from "@module/document/combat.ts"
import { CombatantGURPS } from "@module/document/combatant.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { TokenDocumentGURPS } from "@module/document/token.ts"
import { UserGURPS } from "@module/document/user.ts"
import { JournalEntryGURPS } from "@module/journal-entry/document.ts"
import { JournalEntryPageGURPS } from "@module/journal-entry/page/document.ts"
import { AttributeSettings } from "@module/settings/attributes-config.ts"
import { ColorSettings } from "@module/settings/color-config.ts"
import { HitLocationSettings } from "@module/settings/hit-location-config.ts"
import { DefaultSheetSettings } from "@module/settings/sheet-settings-config.ts"
import { GURPSCONFIG } from "@scripts/config/index.ts"
// import { remigrate } from "@scripts/system/remigrate.ts"
// import { ConditionManager } from "@system/condition-manager.ts"
// import { ManeuverManager } from "@system/maneuver-manager.ts"

interface GameGURPS
	extends Game<
		ActorGURPS2<null>,
		ActorsGURPS,
		ChatMessageGURPS,
		CombatGURPS,
		ItemGURPS2<null>,
		ItemsGURPS,
		Macro,
		Scene,
		UserGURPS<ActorGURPS2<null>>
	> {
	gurps: {
		// ConditionManager: typeof ConditionManager
		Dice: typeof DiceGURPS
		// ManeuverManager: typeof ManeuverManager
		// compendiumBrowser: CompendiumBrowser
		// effectPanel: EffectPanel
		modifierBucket: ModifierBucket
		// modifierList: ModifierList
		// mook: typeof MookGeneratorSheet
		system: {
			// remigrate: typeof remigrate
		}
	}
}

type ConfiguredConfig = Config<
	AmbientLightDocument<Scene | null>,
	ActiveEffect<ActorGURPS2<TokenDocumentGURPS> | ItemGURPS2 | null>,
	ActorGURPS2,
	ActorDelta<TokenDocumentGURPS>,
	ChatLog,
	// ChatLogGURPS,
	ChatMessageGURPS,
	CombatGURPS,
	CombatantGURPS<CombatGURPS | null, TokenDocumentGURPS<Scene>>,
	CombatTracker<CombatGURPS | null>,
	ActorDirectory<ActorGURPS2<null>>,
	ItemDirectory<ItemGURPS2<null>>,
	CompendiumDirectory,
	// CompendiumDirectoryGURPS,
	Hotbar,
	ItemGURPS2,
	Macro,
	MeasuredTemplateDocument<Scene | null>,
	RegionDocument<Scene | null>,
	RegionBehavior<RegionDocument<Scene | null> | null>,
	TileDocument<Scene | null>,
	TokenDocumentGURPS<Scene | null>,
	WallDocument<Scene | null>,
	Scene,
	UserGURPS,
	EffectsCanvasGroup,
	JournalEntryGURPS,
	JournalEntryPageGURPS<JournalEntryGURPS>
>

declare global {
	interface ConfigGURPS extends ConfiguredConfig {
		debug: ConfiguredConfig["debug"] & {
			ruleElement: boolean
		}
		GURPS: typeof GURPSCONFIG
		time: {
			roundTime: number
		}
	}

	const CONFIG: ConfigGURPS
	// const canvas: CanvasGURPS
	const canvas: Canvas

	namespace globalThis {
		// eslint-disable-next-line no-var
		var GURPS: {
			LastActor: ActorGURPS2 | null
			LastToken: TokenDocumentGURPS | null
			[key: string]: unknown
		}
		// eslint-disable-next-line no-var
		var game: GameGURPS
		// eslint-disable-next-line no-var
		var fu: typeof foundry.utils

		// eslint-disable-next-line no-var
		var ui: FoundryUI<
			ActorDirectory<ActorGURPS2<null>>,
			ItemDirectory<ItemGURPS2<null>>,
			// ActorDirectoryGURPS<ActorGURPS<null>>,
			// ItemDirectory<ItemGURPS<null>>,
			ChatLog,
			// ChatLogGURPS,
			CompendiumDirectory,
			// CompendiumDirectoryGURPS,
			CombatTracker<Combat | null>,
			// CombatTrackerGURPS<CombatGURPS | null>,
			Hotbar
		>

		// Add functions to the `Math` namespace for use in `Roll` formulas
		interface Math {
			eq: (a: number, b: number) => boolean
			gt: (a: number, b: number) => boolean
			gte: (a: number, b: number) => boolean
			lt: (a: number, b: number) => boolean
			lte: (a: number, b: number) => boolean
			ne: (a: number, b: number) => boolean
			ternary: (condition: boolean | number, ifTrue: number, ifFalse: number) => number
		}
	}

	interface Window {}

	interface ClientSettings {
		get(module: "gcsga", key: SETTINGS.COLORS): ColorSettings
		get(module: "gcsga", key: SETTINGS.DEFAULT_SHEET_SETTINGS): SheetSettings
		get(module: "gcsga", key: SETTINGS.SSRT): SSRT_SETTING
		get(module: "gcsga", key: SETTINGS.ROLL_FORMULA): string
		get(module: "gcsga", key: SETTINGS.BASE_BOOKS): string
		get(module: "gcsga", key: SETTINGS.DEFAULT_ATTRIBUTES): AttributeSettings
		get(module: "gcsga", key: SETTINGS.DEFAULT_HIT_LOCATIONS): HitLocationSettings
		// get(module: "gcsga", key: "default_sheet_settings.initial_points"): number
		// get(module: "gcsga", key: "default_sheet_settings.tech_level"): string
		// get(module: "gcsga", key: "default_sheet_settings.tech_level"): string
		// get(module: "gcsga", key: "default_sheet_settings.settings"): SourceFromSchema<SheetSettingsSchema>
		// get(module: "gcsga", key: "default_attributes.attributes"): SourceFromSchema<AttributeDefSchema>[]
		// get(module: "gcsga", key: "default_attributes.effects"): AttributeEffect[]
		// get(
		// 	module: "gcsga",
		// 	key: "default_resource_trackers.resource_trackers",
		// ): SourceFromSchema<ResourceTrackerDefSchema>[]
		// get(module: "gcsga", key: "default_move_types.move_types"): SourceFromSchema<MoveTypeDefSchema>[]
		// get(module: "gcsga", key: "default_hit_locations.name"): string
		// get(module: "gcsga", key: "default_hit_locations.roll"): string
		// get(module: "gcsga", key: "default_hit_locations.locations"): HitLocationSource[]
		// get(module: "gcsga", key: "colors.colors"): Record<string, { light: string; dark: string }>
		// get(module: "gcsga", key: "colors.modePreference"): string
		// get(module: "gcsga", key: "automatic_unready"): boolean
		// get(module: "gcsga", key: "initiative_formula"): ((combatant: CombatGURPS["turns"][number]) => string) | null
		// get(module: "gcsga", setting: "compendium_browser_packs"): CompendiumBrowserSettings
		// get(module: "gcsga", setting: "compendium_browser_sources"): CompendiumBrowserSources
		// get(module: "gcsga", setting: "roll_formula"): string
		// get(module: "gcsga", setting: "world_schema_version"): number
		// get(module: "gcsga", setting: "maneuver_visiblity"): MANEUVER_DETAIL_SETTING
		// get(module: "gcsga", setting: "world_schema_version"): number
		// get(module: "gcsga", setting: "world_system_version"): string
	}

	interface ClientSettingsMap {
		get(key: `gcsga.${SETTINGS.COLORS}`): SettingConfig & { default: ColorSettings }
		get(key: `gcsga.${SETTINGS.DEFAULT_SHEET_SETTINGS}`): SettingConfig & { default: DefaultSheetSettings }
		get(key: `gcsga.${SETTINGS.DEFAULT_ATTRIBUTES}`): SettingConfig & { default: AttributeSettings }
		get(key: `gcsga.${SETTINGS.DEFAULT_HIT_LOCATIONS}`): SettingConfig & { default: HitLocationSettings }
		// get(key: "gcsga.worldClock.worldCreatedOn"): SettingConfig & { default: string }
		// get(key: "gcsga.default_sheet_settings.initial_points"): SettingConfig & { default: number }
		// get(key: "gcsga.default_sheet_settings.tech_level"): SettingConfig & { default: string }
		// get(key: "gcsga.default_sheet_settings.tech_level"): SettingConfig & { default: string }
		// get(
		// 	key: "gcsga.default_sheet_settings.settings",
		// ): SettingConfig & { default: SourceFromSchema<SheetSettingsSchema> }
		// get(
		// 	key: "gcsga.default_attributes.attributes",
		// ): SettingConfig & { default: SourceFromSchema<AttributeDefSchema>[] }
		// get(key: "gcsga.default_attributes.effects"): SettingConfig & { default: AttributeEffect[] }
		// get(
		// 	key: "gcsga.default_resource_trackers.resource_trackers",
		// ): SettingConfig & { default: SourceFromSchema<ResourceTrackerDefSchema>[] }
		// get(
		// 	key: "gcsga.default_move_types.move_types",
		// ): SettingConfig & { default: SourceFromSchema<MoveTypeDefSchema>[] }
		// get(key: "gcsga.default_hit_locations.name"): SettingConfig & { default: string }
		// get(key: "gcsga.default_hit_locations.roll"): SettingConfig & { default: string }
		// get(
		// 	key: "gcsga.default_hit_locations.locations",
		// ): SettingConfig & { default: SourceFromSchema<HitLocationSchema>[] }
		// get(key: "gcsga.colors.modePreference"): SettingConfig & { default: string }
		// get(key: "gcsga.colors.colors"): SettingConfig & { default: Record<string, { light: string; dark: string }> }
		// get(key: "gcsga.automatic_unready"): SettingConfig & { default: boolean }
		// get(
		// 	key: "gcsga.initiative_formula",
		// ): SettingConfig & { default: ((combatant: CombatGURPS["turns"][number]) => string) | null }
		// get(key: "gcsga.compendium_browser_packs"): SettingConfig & { default: CompendiumBrowserSettings }
		// get(key: "gcsga.compendium_browser_sources"): SettingConfig & { default: CompendiumBrowserSources }
		// get(key: "gcsga.roll_formula"): SettingConfig & { default: string }
		// get(key: "gcsga.world_schema_version"): SettingConfig & { default: number }
	}

	interface RollMathProxy {
		eq: (a: number, b: number) => boolean
		gt: (a: number, b: number) => boolean
		gte: (a: number, b: number) => boolean
		lt: (a: number, b: number) => boolean
		lte: (a: number, b: number) => boolean
		ne: (a: number, b: number) => boolean
		ternary: (condition: boolean | number, ifTrue: number, ifFalse: number) => number
	}

	const BUILD_MODE: "development" | "production"
	// TODO: reenable
	// const CONDITION_SOURCES: ConditionSource[]
	// const MANEUVER_SOURCES: ConditionSource[]
	// const EN_JSON: typeof EnJSON
	// const ROLL_PARSER: string
}
