/// <reference types="vite/client" />

import { ActorGURPS } from "@actor/base.ts"
import { ItemGURPS } from "@item/base/document.ts"
import { EffectPanel } from "@item/effect/index.ts"
import { CompendiumBrowser } from "@module/apps/compendium-browser/index.ts"
import { CombatGURPS } from "@module/combat/document.ts"
import { CombatantGURPS } from "@module/combatant/document.ts"
import { AttributeEffect } from "@module/data/index.ts"
import { SheetSettings } from "@module/data/sheet_settings.ts"
import { DiceGURPS } from "@module/dice/index.ts"
import { ActiveEffectGURPS } from "@module/effect/index.ts"
import { TokenDocumentGURPS } from "@module/token/index.ts"
import { UserGURPS } from "@module/user/document.ts"
import { GURPSCONFIG } from "@scripts/config/index.ts"
import { AttributeDefObj } from "@sytem/attribute/data.ts"
import { MoveTypeDefObj } from "@sytem/move_type/data.ts"
import { ResourceTrackerDefObj } from "@sytem/resource_tracker/data.ts"
import { CombatTrackerGURPS } from "@ui/combat_tracker.ts"
interface GameGURPS
	extends Game<
		ActorGURPS<null>,
		Actors<ActorGURPS<null>>,
		ChatMessage,
		CombatGURPS,
		ItemGURPS<null>,
		Macro,
		Scene,
		UserGURPS
	> {
	gurps: {
		compendiumBrowser: CompendiumBrowser
		effectPanel: EffectPanel
		Dice: typeof DiceGURPS
	}
}

type ConfiguredConfig = Config<
	AmbientLightDocument<Scene | null>,
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
	MeasuredTemplateDocument<Scene | null>,
	TileDocument<Scene | null>,
	TokenDocumentGURPS,
	WallDocument<Scene | null>,
	Scene,
	UserGURPS,
	EffectsCanvasGroup
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
	const canvas: Canvas

	namespace globalThis {
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
			CombatTrackerGURPS<CombatGURPS | null>
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
		get(module: "gcsga", key: "default_sheet_settings.settings"): SheetSettings
		get(module: "gcsga", key: "default_attributes.attributes"): AttributeDefObj[]
		get(module: "gcsga", key: "default_attributes.effects"): AttributeEffect[]
		get(module: "gcsga", key: "default_resource_trackers.resource_trackers"): ResourceTrackerDefObj[]
		get(module: "gcsga", key: "default_move_types.move_types"): MoveTypeDefObj[]
		get(module: "gcsga", key: "automatic_unready"): boolean
		get(
			module: "gcsga",
			key: "compendium_browser_packs",
		): {
			trait: Record<string, { load: boolean; name: string; skillDefault: boolean }>[]
			skill: Record<string, { load: boolean; name: string; skillDefault: boolean }>[]
			spell: Record<string, { load: boolean; name: string; skillDefault: boolean }>[]
			equipment: Record<string, { load: boolean; name: string; skillDefault: boolean }>[]
		}
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
