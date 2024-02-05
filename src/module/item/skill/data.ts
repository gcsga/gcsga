import { FeatureObj } from "@feature/index.ts"
import { ItemGCSSource, ItemGCSSystemSource } from "@item/gcs/data.ts"
import { ItemType } from "@item/types.ts"
import { PrereqListObj } from "@prereq/data.ts"
import { SkillDefaultObj } from "@sytem/default/index.ts"
import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { difficulty } from "@util/enum/difficulty.ts"
import { study } from "@util/enum/study.ts"
import { Study } from "@util/study.ts"

export type SkillSource = ItemGCSSource<ItemType.Skill, SkillSystemSource>

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
	difficulty: `${string}/${difficulty.Level}`
	points: number
	encumbrance_penalty_multiplier: number
	defaulted_from: SkillDefaultObj
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
