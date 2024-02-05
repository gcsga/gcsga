import { BaseContainerSource, BaseContainerSystemSource } from "@item/container/data.ts"
import { ItemType } from "@item/types.ts"

export type ItemGCSSource<
	TItemType extends ItemType = ItemType,
	TSystemData extends ItemGCSSystemSource = ItemGCSSystemSource,
> = BaseContainerSource<TItemType, TSystemData>

export interface ItemGCSSystemSource extends BaseContainerSystemSource {
	type: ItemType
}
