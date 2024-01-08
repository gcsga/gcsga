import { SkillBonus } from "@feature/skill_bonus"
import { ItemGCSCalcValues, ItemGCSSource, ItemGCSSystemData } from "@item/gcs"
import { Feature } from "@module/config"
import { ItemType, } from "@module/data"
import { PrereqList } from "@prereq"
import { StringCompareType, Study } from "@util"
import { selfctrl, skillsel, study } from "@util/enum"

export type TraitSource = ItemGCSSource<ItemType.Trait, TraitSystemData>

export interface TraitData extends Omit<TraitSource, "effects" | "items">, TraitSystemData {
	readonly type: TraitSource["type"]
	readonly _source: TraitSource
}

export interface TraitSystemData extends ItemGCSSystemData {
	prereqs: PrereqList
	round_down: boolean
	disabled: boolean
	levels: number
	can_level: boolean
	base_points: number
	points_per_level: number
	cr: selfctrl.Roll
	cr_adj: selfctrl.Adjustment
	features?: Feature[]
	study: Study[]
	study_hours_needed: study.Level
	userdesc: string
	type: ItemType.Trait
	calc?: TraitCalcValues
}

export interface TraitCalcValues extends ItemGCSCalcValues {
	enabled: boolean
	points: number
}

const CR_Features = new Map()

const merchantPenalty = new SkillBonus()
Object.assign(merchantPenalty, {
	selection_type: skillsel.Type.Name,
	name: { compare: StringCompareType.IsString, qualifier: "Merchant" },
	specialization: { compare: StringCompareType.AnyString },
	tags: { compare: StringCompareType.AnyString },
})
CR_Features.set(selfctrl.Adjustment.MajorCostOfLivingIncrease, [merchantPenalty])

export { CR_Features }
