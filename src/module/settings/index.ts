import { SETTINGS, SSRT_SETTING, SYSTEM_NAME } from "@module/data/constants.ts"
import { ColorConfig } from "./color-config.ts"
import { SheetSettingsConfig } from "./sheet-settings-config.ts"
import { AttributesConfig } from "./attributes-config.ts"

/**
 * Register all of the system's keybindings.
 */
export function registerSystemKeybindings() {
	game.keybindings.register(SYSTEM_NAME, "skipDialogNormal", {
		name: "KEYBINDINGS.DND5E.SkipDialogNormal",
		editable: [{ key: "ShiftLeft" }, { key: "ShiftRight" }],
	})
}

/**
 * Register all of the system's settings.
 */
export function registerSystemSettings(): void {
	game.settings.registerMenu(SYSTEM_NAME, SETTINGS.COLORS, {
		name: "GURPS.Settings.ColorConfig.Name",
		label: "GURPS.Settings.ColorConfig.Label",
		hint: "GURPS.Settings.ColorConfig.Hint",
		icon: "fas fa-palette",
		type: ColorConfig,
		restricted: false,
	})
	ColorConfig.registerSettings()

	game.settings.registerMenu(SYSTEM_NAME, SETTINGS.DEFAULT_SHEET_SETTINGS, {
		name: "GURPS.Settings.SheetSettings.Name",
		label: "GURPS.Settings.SheetSettings.Label",
		hint: "GURPS.Settings.SheetSettings.Hint",
		icon: "gcs-settings",
		type: SheetSettingsConfig,
		restricted: false,
	})
	SheetSettingsConfig.registerSettings()

	game.settings.registerMenu(SYSTEM_NAME, SETTINGS.DEFAULT_ATTRIBUTES, {
		name: "GURPS.Settings.AttributesConfig.Name",
		label: "GURPS.Settings.AttributesConfig.Label",
		hint: "GURPS.Settings.AttributesConfig.Hint",
		icon: "gcs-attribute",
		type: AttributesConfig,
		restricted: false,
	})
	AttributesConfig.registerSettings()

	game.settings.register(SYSTEM_NAME, SETTINGS.BASE_BOOKS, {
		name: "GURPS.Settings.BaseBooks.Name",
		hint: "GURPS.Settings.BaseBooks.Hint",
		scope: "world",
		config: true,
		type: String,
		choices: {
			gurps: "GURPS.Settings.BaseBooks.Choices.gurps",
			lite: "GURPS.Settings.BaseBooks.Choices.lite",
			dfrpg: "GURPS.Settings.BaseBooks.Choices.dfrpg",
		},
		default: "gurps",
	})

	game.settings.register(SYSTEM_NAME, SETTINGS.ROLL_FORMULA, {
		name: "GURPS.Settings.RollFormula.Name",
		hint: "GURPS.Settings.RollFormula.Hint",
		scope: "world",
		config: true,
		type: String,
		default: "3d6",
	})

	game.settings.register(SYSTEM_NAME, SETTINGS.SSRT, {
		name: "GURPS.Settings.SSRT.Name",
		hint: "GURPS.Settings.SSRT.Hint",
		scope: "world",
		config: true,
		type: String,
		choices: {
			[SSRT_SETTING.STANDARD]: "GURPS.Settings.SSRT.Choices.standard",
			[SSRT_SETTING.SIMPLIFIED]: "GURPS.Settings.SSRT.Choices.simplified",
			[SSRT_SETTING.TENS]: "GURPS.Settings.SSRT.Choices.tens",
		},
		default: SSRT_SETTING.STANDARD,
	})

	// game.settings.registerMenu(SYSTEM_NAME, SETTINGS.DEFAULT_ATTRIBUTES, {
	// 	name: "gurps.settings.default_attributes.name",
	// 	label: "gurps.settings.default_attributes.label",
	// 	hint: "gurps.settings.default_attributes.hint",
	// 	icon: "gcs-attribute",
	// 	type: AttributeSettingsMenuMenu,
	// 	restricted: false,
	// })
	// AttributeSettingsMenu.registerSettings()
	//
	// game.settings.registerMenu(SYSTEM_NAME, SETTINGS.DEFAULT_RESOURCE_TRACKERS, {
	// 	name: "gurps.settings.default_resource_trackers.name",
	// 	label: "gurps.settings.default_resource_trackers.label",
	// 	hint: "gurps.settings.default_resource_trackers.hint",
	// 	icon: "gcs-coins",
	// 	type: ResourceTrackerSettingsMenu,
	// 	restricted: true,
	// })
	// ResourceTrackerSettingsMenu.registerSettings()
	//
	// game.settings.registerMenu(SYSTEM_NAME, SETTINGS.DEFAULT_MOVE_TYPES, {
	// 	name: "gurps.settings.default_move_types.name",
	// 	label: "gurps.settings.default_move_types.label",
	// 	hint: "gurps.settings.default_move_types.hint",
	// 	icon: "fas fa-person-running",
	// 	type: MoveSettings,
	// 	restricted: false,
	// })
	// MoveSettingsMenu.registerSettings()
	//
	// game.settings.registerMenu(SYSTEM_NAME, SETTINGS.DEFAULT_HIT_LOCATIONS, {
	// 	name: "gurps.settings.default_hit_locations.name",
	// 	label: "gurps.settings.default_hit_locations.label",
	// 	hint: "gurps.settings.default_hit_locations.hint",
	// 	icon: "gcs-body-type",
	// 	type: HitLocationSettingsMenu,
	// 	restricted: true,
	// })
	// HitLocationSettingsMenu.registerSettings()
	//
	// game.settings.registerMenu(SYSTEM_NAME, SETTINGS.DEFAULT_SHEET_SETTINGS, {
	// 	name: "gurps.settings.default_sheet_settings.name",
	// 	label: "gurps.settings.default_sheet_settings.label",
	// 	hint: "gurps.settings.default_sheet_settings.hint",
	// 	icon: "gcs-settings",
	// 	type: SheetSettingsMenu,
	// 	restricted: true,
	// })
	// SheetSettingsMenu.registerSettings()
	//
	// game.settings.registerMenu(SYSTEM_NAME, SETTINGS.ROLL_MODIFIERS, {
	// 	name: "gurps.settings.roll_modifiers.name",
	// 	label: "gurps.settings.roll_modifiers.label",
	// 	hint: "gurps.settings.roll_modifiers.hint",
	// 	icon: "gcs-settings",
	// 	type: RollModifierSettingsMenu,
	// 	restricted: false,
	// })
	// RollModifierSettingsMenu.registerSettings()
}
