import { SkillBonus, SkillBonusSelectionType } from "@feature/skill_bonus"
import { ItemGCSSource, ItemGCSSystemData } from "@item/gcs"
import { Feature } from "@module/config"
import { CRAdjustment, ItemType, StringComparison, Study, StudyHoursNeeded } from "@module/data"
import { PrereqList } from "@prereq"

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
	cr: number
	cr_adj: CRAdjustment
	features?: Feature[]
	study: Study[]
	study_hours_needed: StudyHoursNeeded
	userdesc: string
	type: ItemType.Trait
}

const CR_Features = new Map()

CR_Features.set(CRAdjustment.MajorCostOfLivingIncrease, [
	new SkillBonus(
		{
			selection_type: SkillBonusSelectionType.SkillsWithName,
			name: { compare: StringComparison.Is, qualifier: "Merchant" },
			specialization: { compare: StringComparison.None },
			tags: { compare: StringComparison.None },
		},
		{ ready: true }
	),
])

export { CR_Features }
