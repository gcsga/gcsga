import { MigrationBase } from "../base.ts"

export class Migration008UnifiedItemTypes extends MigrationBase {
	static override version = 0.008

	// override async updateItem(source: ItemSourceGURPS): Promise<void> {
	// 	// @ts-expect-error old item type
	// 	if (source.type === "equipment_gcs") {
	// 		// @ts-expect-error old item type
	// 		source.type = ItemType.Equipment
	// 	}
	// }
	//
	// override async updateActor(source: ActorSourceGURPS): Promise<void> {
	// 	// @ts-expect-error old actor type
	// 	if (source.type === "character_gcs") {
	// 		// @ts-expect-error old actor type
	// 		source.type = ActorType.Character
	// 	}
	// }
}
