import { ActorSourceGURPS, ItemSourceGURPS } from "@module/config"

export abstract class MigrationBase {
	static readonly version: number

	readonly version = (this.constructor as typeof MigrationBase).version

	requiresFlush = false

	updateActor?(_actor: ActorSourceGURPS): Promise<void>

	preUpdateItem?(item: ItemSourceGURPS, actor?: ActorSourceGURPS): Promise<void>

	updateItem?(item: ItemSourceGURPS, actor?: ActorSourceGURPS): Promise<void>

	updateUser?(userData: foundry.data.UserData["_source"]): Promise<void>

	migrate?(): Promise<void>
}
