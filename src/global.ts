/// <reference types="vite/client" />

import { ActorGURPS } from "@actor/base.ts"
import { ItemGURPS } from "@item/base/document.ts"
import { ModifierBucket } from "@module/apps/mod_bucket/button.ts"
import { CombatGURPS } from "@module/combat/document.ts"
import { CombatantGURPS } from "@module/combatant/document.ts"
import { AttributeEffect } from "@module/data/index.ts"
import { SheetSettingsObj } from "@module/data/sheet_settings.ts"
import { DiceGURPS } from "@module/dice/index.ts"
import { ActiveEffectGURPS } from "@module/active-effect/index.ts"
import { UserGURPS } from "@module/user/document.ts"
import { GURPSCONFIG } from "@scripts/config/index.ts"
import { AttributeDefObj } from "@sytem/attribute/data.ts"
import { MoveTypeDefObj } from "@sytem/move_type/data.ts"
import { ResourceTrackerDefObj } from "@sytem/resource_tracker/data.ts"
import { CombatTrackerGURPS } from "@ui/combat_tracker.ts"
import { ModifierList } from "@module/apps/mod_list/document.ts"
import {
	CompendiumBrowser,
	CompendiumBrowserSettings,
	CompendiumBrowserSources,
} from "@module/apps/compendium-browser/index.ts"
import { JournalEntryGURPS } from "@module/journal-entry/document.ts"
import { JournalEntryPageGURPS } from "@module/journal-entry/page/document.ts"
import { ChatMessageGURPS } from "@module/chat-message/document.ts"
import { CanvasGURPS } from "@module/canvas/index.ts"
import { SceneGURPS } from "@scene"
import { TokenDocumentGURPS } from "@scene/token-document/index.ts"
import { EffectPanel } from "@item/effect/panel.ts"
import { HitLocationObj } from "@sytem/hit_location/data.ts"
interface GameGURPS
	extends Game<
		ActorGURPS<null>,
		Actors<ActorGURPS<null>>,
		ChatMessageGURPS,
		CombatGURPS,
		ItemGURPS<null>,
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
	CompendiumDirectory,
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
		}
		// eslint-disable-next-line no-var
		var game: GameGURPS
		// eslint-disable-next-line no-var
		var fu: typeof foundry.utils

		// eslint-disable-next-line no-var
		var ui: FoundryUI<
			ActorDirectory<ActorGURPS<null>>,
			ItemDirectory<ItemGURPS<null>>,
			ChatLog,
			CompendiumDirectory,
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
		get(module: "gcsga", key: "automatic_unready"): boolean
		get(module: "gcsga", key: "initiative_formula"): ((combatant: CombatGURPS["turns"][number]) => string) | null
		get(module: "gcsga", setting: "compendium_browser_packs"): CompendiumBrowserSettings
		get(module: "gcsga", setting: "compendium_browser_sources"): CompendiumBrowserSources
		get(module: "gcsga", setting: "roll_formula"): string
		get(module: "gcsga", setting: "world_schema_version"): number
	}

	interface ClientSettingsMap {
		// get(key: "gcsga.worldClock.worldCreatedOn"): SettingConfig & { default: string }
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
	// const CONDITION_SOURCES: ConditionSource[]
	// const EN_JSON: typeof EnJSON
	const ROLL_PARSER: string
}
