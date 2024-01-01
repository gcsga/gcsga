import { SkillBonus } from "@feature/skill_bonus"
import { ItemGCSCalcValues, ItemGCSSource, ItemGCSSystemData } from "@item/gcs"
import { Feature } from "@module/config"
import { ItemType, StringComparisonType, Study, StudyHoursNeeded } from "@module/data"
import { PrereqList } from "@prereq"
import { selfctrl, skillsel } from "@util/enum"

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
	study_hours_needed: StudyHoursNeeded
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
	selection_type: skillsel.Name,
	name: { compare: StringComparisonType.IsString, qualifier: "Merchant" },
	specialization: { compare: StringComparisonType.AnyString },
	tags: { compare: StringComparisonType.AnyString },
})
CR_Features.set(selfctrl.Adjustment.MajorCostOfLivingIncrease, [merchantPenalty])

export { CR_Features }
