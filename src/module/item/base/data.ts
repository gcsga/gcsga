import { ItemType, SYSTEM_NAME } from "@module/data"
import { Context } from "types/foundry/common/abstract/document.mjs"
import { ActiveEffectDataProperties } from "types/foundry/common/data/data.mjs/activeEffectData"
import { ItemDataSource } from "types/foundry/common/data/data.mjs/itemData"
import { PropertiesToSource } from "types/types/helperTypes"

export interface BaseItemSourceGURPS<TItemType extends ItemType = ItemType, TSystemData extends object = object>
	extends ItemDataSource {
	_id: string | null
	type: TItemType
	system: TSystemData
	flags: DeepPartial<ItemFlagsGURPS>
	effects: PropertiesToSource<ActiveEffectDataProperties>[]
}

export enum ItemFlags {
	Deprecation = "deprecation",
	Container = "container",
	Other = "other", // used for equipment only
	// Contents = "contentsData",
}

export interface ItemFlagsGURPS extends Record<string, unknown> {
	[SYSTEM_NAME]?: {
		// contentsData?: Array<any>
		[ItemFlags.Container]?: string | null
		[ItemFlags.Other]?: boolean
	}
}

export interface ItemConstructionContextGURPS extends Context<Actor | Item> {
	gurps?: {
		ready?: boolean
	}
}
