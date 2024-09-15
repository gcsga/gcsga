// import { loadModifiers } from "@module/apps/modifier-bucket/data.ts"
// import { SETTINGS, SSRT_SETTING, SYSTEM_NAME } from "@module/data/constants.ts"
// import { ColorSettings } from "./colors.ts"
// import { AttributeSettings } from "./attributes.ts"
// import { ResourceTrackerSettings } from "./resource-trackers.ts"
// import { HitLocationSettings } from "./hit-locations.ts"
// import { DefaultSheetSettings } from "./sheet-settings.ts"
// import { RollModifierSettings } from "./roll-modifiers.ts"
// import { MoveSettings } from "./move-type.ts"
// import { MigrationRunner } from "@module/migration/index.ts"
//
// export function registerSettings(): void {
// 	if (BUILD_MODE === "development") {
// 		registerWorldSchemaVersion()
// 	}
//
// 	game.settings.registerMenu(SYSTEM_NAME, SETTINGS.COLORS, {
// 		name: "gurps.settings.colors.name",
// 		label: "gurps.settings.colors.label",
// 		hint: "gurps.settings.colors.hint",
// 		icon: "fas fa-palette",
// 		type: ColorSettings,
// 		restricted: false,
// 	})
// 	ColorSettings.registerSettings()
//
// 	game.settings.registerMenu(SYSTEM_NAME, SETTINGS.DEFAULT_ATTRIBUTES, {
// 		name: "gurps.settings.default_attributes.name",
// 		label: "gurps.settings.default_attributes.label",
// 		hint: "gurps.settings.default_attributes.hint",
// 		icon: "gcs-attribute",
// 		type: AttributeSettings,
// 		restricted: false,
// 	})
// 	AttributeSettings.registerSettings()
//
// 	game.settings.registerMenu(SYSTEM_NAME, SETTINGS.DEFAULT_RESOURCE_TRACKERS, {
// 		name: "gurps.settings.default_resource_trackers.name",
// 		label: "gurps.settings.default_resource_trackers.label",
// 		hint: "gurps.settings.default_resource_trackers.hint",
// 		icon: "gcs-coins",
// 		type: ResourceTrackerSettings,
// 		restricted: true,
// 	})
// 	ResourceTrackerSettings.registerSettings()
//
// 	game.settings.registerMenu(SYSTEM_NAME, SETTINGS.DEFAULT_MOVE_TYPES, {
// 		name: "gurps.settings.default_move_types.name",
// 		label: "gurps.settings.default_move_types.label",
// 		hint: "gurps.settings.default_move_types.hint",
// 		icon: "fas fa-person-running",
// 		type: MoveSettings,
// 		restricted: false,
// 	})
// 	MoveSettings.registerSettings()
//
// 	game.settings.registerMenu(SYSTEM_NAME, SETTINGS.DEFAULT_HIT_LOCATIONS, {
// 		name: "gurps.settings.default_hit_locations.name",
// 		label: "gurps.settings.default_hit_locations.label",
// 		hint: "gurps.settings.default_hit_locations.hint",
// 		icon: "gcs-body-type",
// 		type: HitLocationSettings,
// 		restricted: true,
// 	})
// 	HitLocationSettings.registerSettings()
//
// 	game.settings.registerMenu(SYSTEM_NAME, SETTINGS.DEFAULT_SHEET_SETTINGS, {
// 		name: "gurps.settings.default_sheet_settings.name",
// 		label: "gurps.settings.default_sheet_settings.label",
// 		hint: "gurps.settings.default_sheet_settings.hint",
// 		icon: "gcs-settings",
// 		type: DefaultSheetSettings,
// 		restricted: true,
// 	})
// 	DefaultSheetSettings.registerSettings()
//
// 	game.settings.registerMenu(SYSTEM_NAME, SETTINGS.ROLL_MODIFIERS, {
// 		name: "gurps.settings.roll_modifiers.name",
// 		label: "gurps.settings.roll_modifiers.label",
// 		hint: "gurps.settings.roll_modifiers.hint",
// 		icon: "gcs-settings",
// 		type: RollModifierSettings,
// 		restricted: false,
// 	})
// 	RollModifierSettings.registerSettings()
//
// 	game.settings.register(SYSTEM_NAME, SETTINGS.BASIC_SET_PDF, {
// 		name: "gurps.settings.basic_set_pdfs.name",
// 		hint: "gurps.settings.basic_set_pdfs.hint",
// 		scope: "world",
// 		config: true,
// 		type: String,
// 		choices: {
// 			combined: "gurps.settings.basic_set_pdfs.choices.combined",
// 			separate: "gurps.settings.basic_set_pdfs.choices.separate",
// 		},
// 		default: "combined",
// 		onChange: (value: string) => console.log(`Basic Set PDFs : ${value}`),
// 	})
//
// 	game.settings.register(SYSTEM_NAME, SETTINGS.BASE_BOOKS, {
// 		name: "gurps.settings.base_books.name",
// 		hint: "gurps.settings.base_books.hint",
// 		scope: "world",
// 		config: true,
// 		type: String,
// 		choices: {
// 			gurps: "gurps.settings.base_books.choices.gurps",
// 			lite: "gurps.settings.base_books.choices.lite",
// 			dfrpg: "gurps.settings.base_books.choices.dfrpg",
// 		},
// 		default: "gurps",
// 		onChange: (value: string) => {
// 			loadModifiers()
// 			console.log(`Base books: ${value}`)
// 		},
// 	})
//
// 	game.settings.register(SYSTEM_NAME, SETTINGS.SHOW_IMPORT_BUTTON, {
// 		name: "gurps.settings.show_import_button.name",
// 		hint: "gurps.settings.show_import_button.hint",
// 		scope: "client",
// 		config: true,
// 		type: Boolean,
// 		default: true,
// 	})
//
// 	game.settings.register(SYSTEM_NAME, SETTINGS.SERVER_SIDE_FILE_DIALOG, {
// 		name: "gurps.settings.server_side_file_dialog.name",
// 		hint: "gurps.settings.server_side_file_dialog.hint",
// 		scope: "client",
// 		config: true,
// 		type: Boolean,
// 		default: false,
// 	})
//
// 	game.settings.register(SYSTEM_NAME, SETTINGS.PORTRAIT_OVERWRITE, {
// 		name: "gurps.settings.portrait_overwrite.name",
// 		hint: "gurps.settings.portrait_overwrite.hint",
// 		scope: "world",
// 		config: true,
// 		type: Boolean,
// 		default: true,
// 	})
//
// 	game.settings.register(SYSTEM_NAME, SETTINGS.COMPENDIUM_BROWSER_PACKS, {
// 		name: "gurps.settings.compendium_browser_packs.name",
// 		hint: "gurps.settings.compendium_browser_packs.hint",
// 		default: {},
// 		type: Object,
// 		scope: "world",
// 		onChange: () => {
// 			game.gurps.compendiumBrowser.initCompendiumList()
// 			// getDefaultSkills()
// 		},
// 	})
//
// 	game.settings.register(SYSTEM_NAME, SETTINGS.COMPENDIUM_BROWSER_SOURCES, {
// 		name: "gurps.settings.compendium_browser_sources.name",
// 		hint: "gurps.settings.compendium_browser_sources.hint",
// 		default: {
// 			sources: {},
// 		},
// 		type: Object,
// 		scope: "world",
// 		onChange: () => {
// 			game.gurps.compendiumBrowser.packLoader.reset()
// 			game.gurps.compendiumBrowser.initCompendiumList()
// 		},
// 	})
//
// 	game.settings.register(SYSTEM_NAME, SETTINGS.ROLL_FORMULA, {
// 		name: "gurps.settings.roll_formula.name",
// 		hint: "gurps.settings.roll_formula.hint",
// 		scope: "world",
// 		config: true,
// 		type: String,
// 		default: "3d6",
// 		onChange: (value: unknown) => console.log(`Roll Formula : ${value}`),
// 	})
//
// 	game.settings.register(SYSTEM_NAME, SETTINGS.SSRT, {
// 		name: "gurps.settings.ssrt.name",
// 		hint: "gurps.settings.ssrt.hint",
// 		scope: "world",
// 		config: true,
// 		type: String,
// 		choices: {
// 			[SSRT_SETTING.STANDARD]: "gurps.settings.ssrt.choices.standard",
// 			[SSRT_SETTING.SIMPLIFIED]: "gurps.settings.ssrt.choices.simplified",
// 			[SSRT_SETTING.TENS]: "gurps.settings.ssrt.choices.tens",
// 		},
// 		default: "standard",
// 		onChange: (value: string) => console.log(`Range Modifier Formula : ${value}`),
// 	})
//
// 	game.settings.register(SYSTEM_NAME, SETTINGS.STATIC_IMPORT_HP_FP, {
// 		name: "gurps.settings.import_hp_fp.name",
// 		hint: "gurps.settings.import_hp_fp.hint",
// 		scope: "world",
// 		config: true,
// 		type: String,
// 		choices: {
// 			yes: "gurps.settings.import_hp_fp.choices.yes",
// 			no: "gurps.settings.import_hp_fp.choices.no",
// 			ask: "gurps.settings.import_hp_fp.choices.ask",
// 		},
// 		default: "ask",
// 		onChange: (value: string) => console.log(`Import HP & FP : ${value}`),
// 	})
//
// 	game.settings.register(SYSTEM_NAME, SETTINGS.STATIC_IMPORT_BODY_PLAN, {
// 		name: "gurps.settings.import_body_plan.name",
// 		hint: "gurps.settings.import_body_plan.hint",
// 		scope: "world",
// 		config: true,
// 		type: String,
// 		choices: {
// 			yes: "gurps.settings.import_body_plan.choices.yes",
// 			no: "gurps.settings.import_body_plan.choices.no",
// 			ask: "gurps.settings.import_body_plan.choices.ask",
// 		},
// 		default: "ask",
// 		onChange: (value: string) => console.log(`Import Body Plan : ${value}`),
// 	})
//
// 	game.settings.register(SYSTEM_NAME, SETTINGS.IGNORE_IMPORT_NAME, {
// 		name: "GURPS.settings.import_name.name",
// 		hint: "GURPS.settings.import_name.name",
// 		scope: "world",
// 		config: true,
// 		type: Boolean,
// 		default: false,
// 		onChange: value => console.log(`Import Name : ${value}`),
// 	})
//
// 	game.settings.register(SYSTEM_NAME, SETTINGS.INITIATIVE_FORMULA, {
// 		name: "gurps.settings.initiative_formula.name",
// 		hint: "gurps.settings.initiative_formula.hint",
// 		scope: "world",
// 		config: true,
// 		type: String,
// 		default: "$basic_speed+($dx/10000)+(1d6/100000)",
// 		onChange: (value: unknown) => console.log(`Initiative Formula  : ${value}`),
// 		// onChange: () => setInitiative(),
// 	})
//
// 	game.settings.register(SYSTEM_NAME, SETTINGS.DEFAULT_DAMAGE_LOCATION, {
// 		name: "gurps.settings.default_damage_location.name",
// 		hint: "gurps.settings.default_damage_location.hint",
// 		scope: "world",
// 		config: true,
// 		type: String,
// 		choices: {
// 			torso: "gurps.static.hit_location.Torso",
// 			random: "gurps.static.hit_location.Random",
// 		},
// 		default: "torso",
// 		onChange: (value: string) => console.log(`Default Damage Location : ${value}`),
// 	})
//
// 	game.settings.register(SYSTEM_NAME, SETTINGS.AUTOMATIC_UNREADY, {
// 		name: "gurps.settings.automatic_unready.name",
// 		hint: "gurps.settings.automatic_unready.hint",
// 		scope: "world",
// 		config: true,
// 		type: Boolean,
// 		default: true,
// 		onChange: (value: unknown) => console.log(`Automatic Unready : ${value}`),
// 	})
//
// 	game.settings.register(SYSTEM_NAME, SETTINGS.MODIFIER_LIST_COLLAPSE, {
// 		name: "",
// 		hint: "",
// 		scope: "client",
// 		config: false,
// 		type: Boolean,
// 		default: true,
// 	})
//
// 	game.settings.register(SYSTEM_NAME, SETTINGS.MANEUVER_DETAIL, {
// 		name: "gurps.settings.maneuver_detail.name",
// 		hint: "gurps.settings.maneuver_detail.hint",
// 		scope: "world",
// 		config: true,
// 		type: String,
// 		choices: {
// 			full: "gurps.settings.maneuver_detail.choices.full",
// 			no_feint: "gurps.settings.maneuver_detail.choices.no_feint",
// 			general: "gurps.settings.maneuver_detail.choices.general",
// 		},
// 		default: "general",
// 		onChange: value => {
// 			console.log(`${SETTINGS.MANEUVER_DETAIL}: ${value}`)
// 		},
// 	})
//
// 	registerTrackingSettings()
//
// 	if (BUILD_MODE === "production") {
// 		registerWorldSchemaVersion()
// 	}
// }
//
// /** Registers temporary settings for tracking things like first time launches*/
// function registerTrackingSettings(): void {
// 	game.settings.register(SYSTEM_NAME, SETTINGS.WORLD_SYSTEM_VERSION, {
// 		name: "World System Version",
// 		scope: "world",
// 		config: false,
// 		default: game.system.version,
// 		type: String,
// 	})
// }
//
// function registerWorldSchemaVersion(): void {
// 	game.settings.register(SYSTEM_NAME, SETTINGS.WORLD_SCHEMA_VERSION, {
// 		name: "gurps.settings.world_schema_version.name",
// 		hint: "gurps.settings.world_schema_version.hint",
// 		scope: "world",
// 		config: true,
// 		default: MigrationRunner.LATEST_SCHEMA_VERSION,
// 		type: Number,
// 		requiresReload: true,
// 	})
// }
