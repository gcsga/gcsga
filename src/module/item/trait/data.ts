import {
	AbstractContainerSource,
	AbstractContainerSystemData,
	AbstractContainerSystemSource,
} from "@item/abstract-container/data.ts"
import { ItemType } from "@module/data/constants.ts"
import { FeatureObj, PrereqListObj, SkillBonus, Study } from "@system"
import { StringCompareType, selfctrl, skillsel, study } from "@util"

type TraitSource = AbstractContainerSource<ItemType.Trait, TraitSystemSource>

interface TraitSystemSource extends AbstractContainerSystemSource {
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

const CRFeatures = new Map()

const merchantPenalty = new SkillBonus()
Object.assign(merchantPenalty, {
	selection_type: skillsel.Type.Name,
	name: { compare: StringCompareType.IsString, qualifier: "Merchant" },
	specialization: { compare: StringCompareType.AnyString },
	tags: { compare: StringCompareType.AnyString },
})
CRFeatures.set(selfctrl.Adjustment.MajorCostOfLivingIncrease, [merchantPenalty])

interface TraitSystemData extends TraitSystemSource, AbstractContainerSystemData {}

export { CRFeatures }
export type { TraitSource, TraitSystemSource, TraitSystemData }
