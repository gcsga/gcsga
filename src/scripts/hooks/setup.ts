import { registerSheets } from "@scripts/register-sheets.ts"

/** This runs after game data has been requested and loaded from the servers, so entities exist */
export const Setup = {
	listen: (): void => {
		Hooks.once("setup", () => {
			// Register actor and item sheets
			registerSheets()

			// Set Hover by Owner as defaults for Default Token Configuration
			const defaultTokenSettingsDefaults = game.settings.settings.get("core.defaultToken").default
			defaultTokenSettingsDefaults.displayName = CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
			defaultTokenSettingsDefaults.displayBars = CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
		})
	},
}
