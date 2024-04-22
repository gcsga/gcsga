import {
	AbstractContainerSource,
	AbstractContainerSystemData,
	AbstractContainerSystemSource,
} from "@item/abstract-container/data.ts"
import { ItemType } from "@module/data/constants.ts"
import { SkillDifficulty } from "@module/data/types.ts"
import { FeatureObj, PrereqListObj, SkillDefaultObj, Study } from "@system"
import { TooltipGURPS, study } from "@util"

type SkillSource = AbstractContainerSource<ItemType.Skill, SkillSystemSource>

interface SkillSystemSource extends AbstractContainerSystemSource {
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

type EncumbrancePenaltyMultiplier = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

interface SkillLevel {
	level: number
	relativeLevel: number
	tooltip: TooltipGURPS
}

interface SkillSystemData extends SkillSystemSource, AbstractContainerSystemData {}

export type { EncumbrancePenaltyMultiplier, SkillLevel, SkillSource, SkillSystemData, SkillSystemSource }
