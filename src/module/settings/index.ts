import { SETTINGS, SYSTEM_NAME } from "@module/data/constants.ts"
import { ColorConfig } from "./color-config.ts"

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
		name: "gurps.settings.colors.name",
		label: "gurps.settings.colors.label",
		hint: "gurps.settings.colors.hint",
		icon: "fas fa-palette",
		type: ColorConfig,
		restricted: false,
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
