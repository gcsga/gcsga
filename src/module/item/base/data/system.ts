import { ItemType } from "@item/types.ts"
import { MigrationRecord, SYSTEM_NAME } from "@module/data/misc.ts"

type BaseItemSourceGURPS<TType extends ItemType, TSystemSource extends object = object> = foundry.documents.ItemSource<
	TType,
	TSystemSource
> & {
	type: TType
	flags: ItemSourceFlagsGURPS
}

enum ItemFlags {
	Deprecation = "deprecation",
	Container = "container",
	Other = "other", // used for equipment only
	Unready = "unready",
}

interface ItemFlagsGURPS extends Record<string, unknown> {
	[SYSTEM_NAME]?: {
		[ItemFlags.Container]?: string | null
		[ItemFlags.Other]?: boolean
		[ItemFlags.Unready]?: boolean
	}
}

interface ItemSourceFlagsGURPS extends Record<string, unknown> {
	[SYSTEM_NAME]?: {
		[ItemFlags.Container]?: string | null
		[ItemFlags.Other]?: boolean
		[ItemFlags.Unready]?: boolean
	}
}

interface ItemSystemSource {
	/** A record of this actor's current world schema version as well a log of the last migration to occur */
	_migration: MigrationRecord
	/** Legacy location of `MigrationRecord` */
	schema?: Readonly<{ version: number | null; lastMigration: object | null }>

	/** A non-unique but human-readable identifier for this item */
	slug: string | null
}

export { ItemFlags }

export type { BaseItemSourceGURPS, ItemFlagsGURPS, ItemSystemSource }
