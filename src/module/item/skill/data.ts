import { ItemType, SkillDifficulty } from "@data"
import { FeatureObj } from "@feature/index.ts"
import { BaseContainerSource } from "@item/container/data.ts"
import { ItemGCSSystemSource } from "@item/gcs/data.ts"
import { PrereqListObj } from "@prereq/data.ts"
import { SkillDefaultObj } from "@sytem/default/index.ts"
import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { study } from "@util/enum/study.ts"
import { Study } from "@util/study.ts"

export type SkillSource = BaseContainerSource<ItemType.Skill, SkillSystemSource>

export interface SkillSystemSource extends ItemGCSSystemSource {
	type: ItemType.Skill
	name: string
	reference: string
	reference_highlight: string
	notes: string
	vtt_notes: string
	tags: string[]
	specialization: string
	tech_level: string
	tech_level_required: boolean
	difficulty: SkillDifficulty
	points: number
	encumbrance_penalty_multiplier: number
	defaulted_from: SkillDefaultObj | null
	defaults: SkillDefaultObj[]
	prereqs: PrereqListObj
	features: FeatureObj[]
	study: Study[]
	study_hours_needed: study.Level | ""
}

export type EncumbrancePenaltyMultiplier = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export interface SkillLevel {
	level: number
	relative_level: number
	tooltip: TooltipGURPS
}
