import { ItemGCSCalcValues, ItemGCSSource, ItemGCSSystemData } from "@item/gcs"
import { Feature } from "@module/config"
import { ItemType, Study, StudyHoursNeeded } from "@module/data"
import { SkillDefault } from "@module/default"
import { TooltipGURPS } from "@module/tooltip"
import { PrereqList } from "@prereq"
import { difficulty } from "@util/enum"

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
	// Should not be needed
	// TODO: find a way to remove
	tech_level_required: boolean
	encumbrance_penalty_multiplier: EncumbrancePenaltyMultiplier
	// May change to object type
	difficulty: `${string}/${difficulty.Level}`
	points: number
	// To change later
	defaulted_from?: SkillDefault
	defaults: SkillDefault[]
	features: Feature[]
	study: Study[]
	study_hours_needed: StudyHoursNeeded
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
