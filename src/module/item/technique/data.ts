import { FeatureObj } from "@feature/index.ts"
import { ItemGCSSource, ItemGCSSystemSource } from "@item/gcs/data.ts"
import { EncumbrancePenaltyMultiplier } from "@item/skill/data.ts"
import { ItemType } from "@item/types.ts"
import { PrereqList } from "@prereq/prereq_list.ts"
import { SkillDefault } from "@sytem/default/index.ts"
import { difficulty } from "@util/enum/difficulty.ts"
import { study } from "@util/enum/study.ts"
import { Study } from "@util/study.ts"

export type TechniqueSource = ItemGCSSource<ItemType.Technique, TechniqueSystemSource>

export interface TechniqueSystemSource extends ItemGCSSystemSource {
	prereqs: PrereqList
	tech_level: string
	encumbrance_penalty_multiplier: EncumbrancePenaltyMultiplier
	difficulty: (typeof difficulty.TechiqueLevels)[number]
	points: number
	defaulted_from: SkillDefault | null
	defaults: SkillDefault[]
	features: FeatureObj[]
	default: SkillDefault
	limit: number
	limited: boolean
	study: Study[]
	study_hours_needed: study.Level
}
