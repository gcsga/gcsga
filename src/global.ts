/// <reference types="vite/client" />

import { ActorGURPS } from "@actor"
import { ItemGURPS } from "@item"
import { EffectPanel } from "@item/abstract-effect/panel.ts"
import { ConditionSource } from "@item/data/index.ts"
import { ActiveEffectGURPS } from "@module/active-effect/index.ts"
import {
	CompendiumBrowser,
	CompendiumBrowserSettings,
	CompendiumBrowserSources,
} from "@module/apps/compendium-browser/index.ts"
import { ModifierBucket } from "@module/apps/modifier-bucket/button.ts"
import { ModifierList } from "@module/apps/modifier-list/document.ts"
import { ActorDirectoryGURPS } from "@module/apps/sidebar/actor-directory.ts"
import { CombatTrackerGURPS } from "@module/apps/sidebar/combat-tracker.ts"
import { CompendiumDirectoryGURPS } from "@module/apps/sidebar/compendium-directory.ts"
import { ItemDirectoryGURPS } from "@module/apps/sidebar/item-directory.ts"
import { CanvasGURPS } from "@module/canvas/index.ts"
import { ChatMessageGURPS } from "@module/chat-message/index.ts"
import { ItemsGURPS } from "@module/collection/items.ts"
import { CombatGURPS, CombatantGURPS } from "@module/combat/index.ts"
import { AttributeEffect } from "@module/data/index.ts"
import { SheetSettingsObj } from "@module/data/sheet-settings.ts"
import { DiceGURPS } from "@module/dice/index.ts"
import { JournalEntryGURPS } from "@module/journal-entry/document.ts"
import { JournalEntryPageGURPS } from "@module/journal-entry/page/document.ts"
import { UserGURPS } from "@module/user/document.ts"
import { SceneGURPS, TokenDocumentGURPS } from "@scene"
import { GURPSCONFIG } from "@scripts/config/index.ts"
import { AttributeDefObj, MoveTypeDefObj, ResourceTrackerDefObj } from "@system"
import { ConditionManager } from "@system/condition-manager.ts"
import { HitLocationObj } from "@system/hit-location/data.ts"
import { ManeuverManager } from "@system/maneuver-manager.ts"

interface GameGURPS
	extends Game<
		ActorGURPS<null>,
		Actors<ActorGURPS<null>>,
		ChatMessageGURPS,
		CombatGURPS,
		ItemGURPS<null>,
		ItemsGURPS<ItemGURPS<null>>,
		Macro,
		SceneGURPS,
		UserGURPS
	> {
	gurps: {
		compendiumBrowser: CompendiumBrowser
		modifierBucket: ModifierBucket
		modifierList: ModifierList
		effectPanel: EffectPanel
		Dice: typeof DiceGURPS
		ConditionManager: typeof ConditionManager
		ManeuverManager: typeof ManeuverManager
	}
}

type ConfiguredConfig = Config<
	AmbientLightDocument<SceneGURPS | null>,
	ActiveEffectGURPS<ActorGURPS | ItemGURPS | null>,
	ActorGURPS,
	ActorDelta<TokenDocumentGURPS>,
	ChatLog,
	ChatMessage,
	CombatGURPS,
	CombatantGURPS<CombatGURPS | null, TokenDocumentGURPS>,
	CombatTrackerGURPS<CombatGURPS | null>,
	ActorDirectoryGURPS<ActorGURPS<null>>,
	ItemDirectoryGURPS<ItemGURPS<null>>,
	CompendiumDirectoryGURPS,
	Hotbar,
	ItemGURPS,
	Macro,
	MeasuredTemplateDocument<SceneGURPS | null>,
	TileDocument<SceneGURPS | null>,
	TokenDocumentGURPS<SceneGURPS | null>,
	WallDocument<SceneGURPS | null>,
	SceneGURPS,
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
	const canvas: CanvasGURPS

	namespace globalThis {
		// eslint-disable-next-line no-var
		var GURPS: {
			LastActor: ActorGURPS | null
			LastToken: TokenDocumentGURPS | null
			[key: string]: unknown
		}
		// eslint-disable-next-line no-var
		var game: GameGURPS
		// eslint-disable-next-line no-var
		var fu: typeof foundry.utils

		// eslint-disable-next-line no-var
		var ui: FoundryUI<
			ActorDirectoryGURPS<ActorGURPS<null>>,
			ItemDirectory<ItemGURPS<null>>,
			ChatLog,
			CompendiumDirectoryGURPS,
			CombatTrackerGURPS<CombatGURPS | null>,
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
		get(module: "gcsga", key: "default_sheet_settings.initial_points"): number
		get(module: "gcsga", key: "default_sheet_settings.tech_level"): string
		get(module: "gcsga", key: "default_sheet_settings.tech_level"): string
		get(module: "gcsga", key: "default_sheet_settings.settings"): SheetSettingsObj
		get(module: "gcsga", key: "default_attributes.attributes"): AttributeDefObj[]
		get(module: "gcsga", key: "default_attributes.effects"): AttributeEffect[]
		get(module: "gcsga", key: "default_resource_trackers.resource_trackers"): ResourceTrackerDefObj[]
		get(module: "gcsga", key: "default_move_types.move_types"): MoveTypeDefObj[]
		get(module: "gcsga", key: "default_hit_locations.name"): string
		get(module: "gcsga", key: "default_hit_locations.roll"): string
		get(module: "gcsga", key: "default_hit_locations.locations"): HitLocationObj[]
		get(module: "gcsga", key: "colors.colors"): Record<string, { light: string; dark: string }>
		get(module: "gcsga", key: "colors.modePreference"): string
		get(module: "gcsga", key: "automatic_unready"): boolean
		get(module: "gcsga", key: "initiative_formula"): ((combatant: CombatGURPS["turns"][number]) => string) | null
		get(module: "gcsga", setting: "compendium_browser_packs"): CompendiumBrowserSettings
		get(module: "gcsga", setting: "compendium_browser_sources"): CompendiumBrowserSources
		get(module: "gcsga", setting: "roll_formula"): string
		get(module: "gcsga", setting: "world_schema_version"): number
	}

	interface ClientSettingsMap {
		// get(key: "gcsga.worldClock.worldCreatedOn"): SettingConfig & { default: string }
		get(key: "gcsga.default_sheet_settings.initial_points"): SettingConfig & { default: number }
		get(key: "gcsga.default_sheet_settings.tech_level"): SettingConfig & { default: string }
		get(key: "gcsga.default_sheet_settings.tech_level"): SettingConfig & { default: string }
		get(key: "gcsga.default_sheet_settings.settings"): SettingConfig & { default: SheetSettingsObj }
		get(key: "gcsga.default_attributes.attributes"): SettingConfig & { default: AttributeDefObj[] }
		get(key: "gcsga.default_attributes.effects"): SettingConfig & { default: AttributeEffect[] }
		get(
			key: "gcsga.default_resource_trackers.resource_trackers",
		): SettingConfig & { default: ResourceTrackerDefObj[] }
		get(key: "gcsga.default_move_types.move_types"): SettingConfig & { default: MoveTypeDefObj[] }
		get(key: "gcsga.default_hit_locations.name"): SettingConfig & { default: string }
		get(key: "gcsga.default_hit_locations.roll"): SettingConfig & { default: string }
		get(key: "gcsga.default_hit_locations.locations"): SettingConfig & { default: HitLocationObj[] }
		get(key: "gcsga.colors.modePreference"): SettingConfig & { default: string }
		get(key: "gcsga.colors.colors"): SettingConfig & { default: Record<string, { light: string; dark: string }> }
		get(key: "gcsga.automatic_unready"): SettingConfig & { default: boolean }
		get(
			key: "gcsga.initiative_formula",
		): SettingConfig & { default: ((combatant: CombatGURPS["turns"][number]) => string) | null }
		get(key: "gcsga.compendium_browser_packs"): SettingConfig & { default: CompendiumBrowserSettings }
		get(key: "gcsga.compendium_browser_sources"): SettingConfig & { default: CompendiumBrowserSources }
		get(key: "gcsga.roll_formula"): SettingConfig & { default: string }
		get(key: "gcsga.world_schema_version"): SettingConfig & { default: number }
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
	const CONDITION_SOURCES: ConditionSource[]
	const MANEUVER_SOURCES: ConditionSource[]
	// const EN_JSON: typeof EnJSON
	// const ROLL_PARSER: string
}
