import { ItemGCSSource, ItemGCSSystemSource } from "@item/gcs/data.ts"
import { ItemType } from "@item/types.ts"

export type SkillContainerSource = ItemGCSSource<ItemType.SkillContainer, SkillContainerSystemSource>

export interface SkillContainerSystemSource extends ItemGCSSystemSource {}
