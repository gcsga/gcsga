import { ItemType } from "@data"
import { FeatureObj, SkillBonus } from "@feature/index.ts"
import { BaseContainerSource } from "@item/container/data.ts"
import { ItemGCSSystemSource } from "@item/gcs/data.ts"
import { PrereqListObj } from "@prereq/data.ts"
import { selfctrl } from "@util/enum/selfctrl.ts"
import { skillsel } from "@util/enum/skillsel.ts"
import { study } from "@util/enum/study.ts"
import { StringCompareType } from "@util/string_criteria.ts"
import { Study } from "@util/study.ts"

export type TraitSource = BaseContainerSource<ItemType.Trait, TraitSystemSource>

export interface TraitSystemSource extends ItemGCSSystemSource {
	type: ItemType.Trait
	name: string
	reference: string
	reference_highlight: string
	notes: string
	vtt_notes: string
	userdesc: string
	tags: string[]
	base_points: number
	levels: number
	points_per_level: number
	prereqs: PrereqListObj
	features: FeatureObj[]
	study: Study[]
	cr: selfctrl.Roll
	cr_adj: selfctrl.Adjustment
	study_hours_needed: study.Level | ""
	disabled: boolean
	round_down: boolean
	can_level: boolean
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
