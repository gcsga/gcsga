import { ItemType } from "@item/types.ts"
import { SYSTEM_NAME } from "@module/data/misc.ts"

type BaseItemSourceGURPS<
	TType extends ItemType = ItemType,
	TSystemSource extends object = object,
> = foundry.documents.ItemSource<TType, TSystemSource> & {
	flags: DeepPartial<ItemFlagsGURPS>
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

export { ItemFlags }

export type { BaseItemSourceGURPS, ItemFlagsGURPS }
