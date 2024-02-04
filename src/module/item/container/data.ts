import { ItemType } from "@item"
import { BaseItemSourceGURPS, ItemSystemSource } from "@item/base/data/system.ts"

export type BaseContainerSource<
	TItemType extends ItemType = ItemType,
	TSystemData extends object = BaseContainerSystemSource,
> = BaseItemSourceGURPS<TItemType, TSystemData>

export interface BaseContainerSystemSource extends ItemSystemSource {
	open?: boolean
}
