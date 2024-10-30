import { SOCKET } from "@data"
import { loadModifiers } from "@module/apps/modifier-bucket/data.ts"
import { SetGameGURPS } from "@scripts/set-game-gurps.ts"

// Import Submodules
import * as applications from "@module/applications/index.ts"
import * as documents from "@module/documents/index.ts"
import * as dataModels from "@module/data/index.ts"

export const Ready = {
	listen: (): void => {
		Hooks.once("ready", async () => {
			console.log("GURPS | Starting GURPS Game Aid")
			console.debug(`GURPS | Build mode: ${BUILD_MODE}`)
			// Some of game.gurps must wait until the ready phase
			SetGameGURPS.onReady()

			// Do anything once the system is ready
			// ColorSettings.applyColors()
			loadModifiers()
			// getDefaultSkills()

			globalThis.GURPS = {
				applications,
				documents,
				dataModels,
			}

			// Determine whether a system migration is required and feasible
			// const currentVersion = game.settings.get(SYSTEM_NAME, SETTINGS.WORLD_SCHEMA_VERSION)

			// // Save the current world schema version if hasn't before.
			// storeInitialWorldVersions().then(async () => {
			// 	// Ensure only a single GM will run migrations if multiple are logged in
			// 	if (game.user !== game.users.activeGM) return
			//
			// 	// Perform migrations, if any
			// 	const migrationRunner = new MigrationRunner(MigrationList.constructFromVersion(currentVersion))
			// 	if (migrationRunner.needsMigration()) {
			// 		if (currentVersion && currentVersion < MigrationRunner.MINIMUM_SAFE_VERSION) {
			// 			ui.notifications.error(
			// 				`Your GURPS system data is from too old a Foundry version and cannot be reliably migrated to the latest version. The process will be attempted, but errors may occur.`,
			// 				{ permanent: true },
			// 			)
			// 		}
			// 		await migrationRunner.runMigration()
			// 		new MigrationSummary().render(true)
			// 	}
			//
			// 	// Update the world system version
			// 	const previous = game.settings.get(SYSTEM_NAME, SETTINGS.WORLD_SYSTEM_VERSION)
			// 	const current = game.system.version
			// 	if (fu.isNewerVersion(current, previous)) {
			// 		await game.settings.set(SYSTEM_NAME, SETTINGS.WORLD_SYSTEM_VERSION, current)
			// 	}
			// })

			// Enable drag image
			// createDragImage(null, null)

			// Set default user flag state
			// if (canvas && canvas.hud) {
			// 	canvas.hud.token = new TokenHUDGURPS()
			// }

			CONFIG.Combat.initiative.decimals = 5
			// setInitiative()

			game.socket?.on("system.gcsga", async (response: Record<string, unknown>) => {
				switch (response.type as SOCKET) {
					case SOCKET.UPDATE_BUCKET:
						// Ui.notifications?.info(response.users)
						// game.gurps.modifierList.render()
						// game.gurps.modifierBucket.render()
						break
					case SOCKET.INITIATIVE_CHANGED:
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						CONFIG.Combat.initiative.formula = response.formula as any
						break
					default:
						return console.error("Unknown socket:", response.type)
				}
			})
		})
	},
}
