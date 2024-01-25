import { ItemGCSCalcValues, ItemGCSSource, ItemGCSSystemData } from "@item/index.ts"
import { ItemType } from "@module/data/misc.ts"

export type SkillContainerSource = ItemGCSSource<ItemType.SkillContainer, SkillContainerSystemData>

export interface SkillContainerData extends Omit<SkillContainerSource, "effects" | "items">, SkillContainerSystemData {
	readonly type: SkillContainerSource["type"]
	data: SkillContainerSystemData
	readonly _source: SkillContainerSource
}

export interface SkillContainerSystemData extends ItemGCSSystemData {
	calc?: SkillContainerCalcValues
}

export interface SkillContainerCalcValues extends ItemGCSCalcValues {
	points: number
}
