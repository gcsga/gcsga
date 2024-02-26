import { ItemFlags, ItemType, MigrationRecord, SYSTEM_NAME } from "@data"

type BaseItemSourceGURPS<
	TType extends ItemType = ItemType,
	TSystemSource extends object = object,
> = foundry.documents.ItemSource<TType, TSystemSource> & {
	flags: ItemSourceFlagsGURPS
}

interface ItemFlagsGURPS extends foundry.documents.ItemFlags {
	[SYSTEM_NAME]: {
		[ItemFlags.Container]: string | null
		[ItemFlags.Other]: boolean
		[ItemFlags.Unready]: boolean
	}
}

interface ItemSourceFlagsGURPS extends DeepPartial<foundry.documents.ItemFlags> {
	[SYSTEM_NAME]?: {
		[ItemFlags.Container]?: string | null
		[ItemFlags.Other]?: boolean
		[ItemFlags.Unready]?: boolean
	}
}

interface ItemSystemSource {
	/** A record of this actor's current world schema version as well a log of the last migration to occur */
	_migration: MigrationRecord

	/** A non-unique but human-readable identifier for this item */
	slug: string | null
}

interface ItemSystemData extends ItemSystemSource {}

export type { BaseItemSourceGURPS, ItemFlagsGURPS, ItemSystemSource, ItemSystemData }
