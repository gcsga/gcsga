import { ItemGCSSource, ItemGCSSystemSource } from "@item/gcs/data.ts"
import { ItemType } from "@item/types.ts"

export type SpellContainerSource = ItemGCSSource<ItemType.SpellContainer, SpellContainerSystemSource>

export interface SpellContainerSystemSource extends ItemGCSSystemSource {}
