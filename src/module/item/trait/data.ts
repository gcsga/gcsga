import { FeatureObj, SkillBonus } from "@feature/index.ts"
import { ItemGCSSource, ItemGCSSystemSource } from "@item/gcs/data.ts"
import { ItemType } from "@item/types.ts"
import { PrereqList } from "@prereq/prereq_list.ts"
import { selfctrl } from "@util/enum/selfctrl.ts"
import { skillsel } from "@util/enum/skillsel.ts"
import { study } from "@util/enum/study.ts"
import { StringCompareType } from "@util/string_criteria.ts"
import { Study } from "@util/study.ts"

export type TraitSource = ItemGCSSource<ItemType.Trait, TraitSystemSource>

export interface TraitData extends Omit<TraitSource, "effects" | "items">, TraitSystemSource {
	readonly type: TraitSource["type"]
	readonly _source: TraitSource
}

export interface TraitSystemSource extends ItemGCSSystemSource {
	prereqs: PrereqList
	round_down: boolean
	disabled: boolean
	levels: number
	can_level: boolean
	base_points: number
	points_per_level: number
	cr: selfctrl.Roll
	cr_adj: selfctrl.Adjustment
	features?: FeatureObj[]
	study: Study[]
	study_hours_needed: study.Level | ""
	userdesc: string
	type: ItemType.Trait
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
