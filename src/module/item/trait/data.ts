import {
	AbstractContainerSource,
	AbstractContainerSystemData,
	AbstractContainerSystemSource,
} from "@item/abstract-container/data.ts"
import { ItemType } from "@module/data/constants.ts"
import { FeatureObj, PrereqListObj, SkillBonus, Study } from "@system"
import { StringCompareType, feature, selfctrl, skillsel, study } from "@util"

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

const CR_FEATURES = new Map([
	[
		selfctrl.Adjustment.MajorCostOfLivingIncrease,
		[
			SkillBonus.fromObject({
				type: feature.Type.SkillBonus,
				selection_type: skillsel.Type.Name,
				name: { compare: StringCompareType.IsString, qualifier: "Merchant" },
				specialization: { compare: StringCompareType.AnyString },
				tags: { compare: StringCompareType.AnyString },
				amount: 1,
			}),
		],
	],
])

interface TraitSystemData extends TraitSystemSource, AbstractContainerSystemData {}

export { CR_FEATURES }
export type { TraitSource, TraitSystemSource, TraitSystemData }
