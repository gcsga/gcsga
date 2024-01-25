import { FeatureObj } from "@feature/index.ts"
import { ItemGCSCalcValues, ItemGCSSource, ItemGCSSystemData } from "@item/gcs/data.ts"
import { ItemType } from "@module/data/misc.ts"
import { PrereqList } from "@prereq/prereq_list.ts"
import { SkillDefault } from "@sytem/default/index.ts"
import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { difficulty } from "@util/enum/difficulty.ts"
import { study } from "@util/enum/study.ts"
import { Study } from "@util/study.ts"

export type SkillSource = ItemGCSSource<ItemType.Skill, SkillSystemData>

// Export class SkillData extends BaseItemDataGURPS<SkillGURPS> {}

export interface SkillData extends Omit<SkillSource, "effects">, SkillSystemData {
	readonly type: SkillSource["type"]
	data: SkillSystemData

	readonly _source: SkillSource
}

export interface SkillSystemData extends ItemGCSSystemData {
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
	calc?: SkillCalcValues
}

export interface SkillCalcValues extends ItemGCSCalcValues {
	level: number
	rsl: string
	points: number
	resolved_notes?: string
	tooltip: string
	difficulty: string
}

export type EncumbrancePenaltyMultiplier = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export interface SkillLevel {
	level: number
	relative_level: number
	tooltip: TooltipGURPS
}
