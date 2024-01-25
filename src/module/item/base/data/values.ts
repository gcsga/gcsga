import { SYSTEM_NAME } from "@module/data/misc.ts"

export enum ItemFlags {
	Deprecation = "deprecation",
	Container = "container",
	Other = "other", // used for equipment only
	Unready = "unready",
}

export interface ItemFlagsGURPS extends Record<string, unknown> {
	[SYSTEM_NAME]?: {
		[ItemFlags.Container]?: string | null
		[ItemFlags.Other]?: boolean
		[ItemFlags.Unready]?: boolean
	}
}
