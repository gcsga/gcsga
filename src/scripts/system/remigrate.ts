// import { MigrationRunner } from "@module/migration/runner/index.ts"
// import { MigrationList } from "@module/migration/index.ts"
//
// /** For use in worlds to rerun select migrations */
// export async function remigrate(versionRange: { from: number; to?: number }): Promise<void> {
// 	if (!game.ready) {
// 		ui.notifications.warn("gurps.migrations.worldnotready", { localize: true })
// 		return
// 	}
// 	if (game.user.role !== CONST.USER_ROLES.GAMEMASTER) {
// 		ui.notifications.error("gurps.migrations.onlygmcanuse", { localize: true })
// 		return
// 	}
//
// 	const migrations = MigrationList.constructRange(versionRange.from, versionRange.to)
// 	if (migrations.length === 0 || versionRange.from < MigrationRunner.RECOMMENDED_SAFE_VERSION) {
// 		ui.notifications.error(
// 			game.i18n.format("gurps.migrations.outsideschemarange", {
// 				minimum: MigrationRunner.RECOMMENDED_SAFE_VERSION,
// 				maximum: MigrationRunner.LATEST_SCHEMA_VERSION,
// 			}),
// 		)
// 		return
// 	}
//
// 	return new MigrationRunner(migrations).runMigration(true)
// }
