import { FeatureObj } from "@feature/index.ts"
import { ItemGCSSource, ItemGCSSystemSource } from "@item/gcs/data.ts"
import { ItemType } from "@item/types.ts"
import { PrereqList } from "@prereq/prereq_list.ts"
import { SkillDefault } from "@sytem/default/index.ts"
import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { difficulty } from "@util/enum/difficulty.ts"
import { study } from "@util/enum/study.ts"
import { Study } from "@util/study.ts"

export type SkillSource = ItemGCSSource<ItemType.Skill, SkillSystemSource>

export interface SkillSystemSource extends ItemGCSSystemSource {
	prereqs: PrereqList
	specialization: string
	tech_level: string
	tech_level_required: boolean
	encumbrance_penalty_multiplier: EncumbrancePenaltyMultiplier
	difficulty: `${string}/${difficulty.Level}`
	points: number
	defaulted_from: SkillDefault | null
	defaults: SkillDefault[]
	features: FeatureObj[]
	study: Study[]
	study_hours_needed: study.Level
}

export type EncumbrancePenaltyMultiplier = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export interface SkillLevel {
	level: number
	relative_level: number
	tooltip: TooltipGURPS
}
