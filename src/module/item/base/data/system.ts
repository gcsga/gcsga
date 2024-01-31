import { ItemType } from "@item/types.ts"
import { ItemFlagsGURPS } from "./values.ts"

export type BaseItemSourceGURPS<
	TType extends ItemType = ItemType,
	TSystemSource extends object = object,
> = foundry.documents.ItemSource<TType, TSystemSource> & {
	flags: DeepPartial<ItemFlagsGURPS>
}
// 	extends  {
// 	_id: string | null
// 	type: TItemType
// 	system: TSystemData
// 	flags: DeepPartial<ItemFlagsGURPS>
// 	effects: PropertiesToSource<ActiveEffectDataProperties>[]
// }

// export interface ItemConstructionContextGURPS extends Context<Actor | Item> {
// 	gurps?: {
// 		ready?: boolean
// 	}
// }
