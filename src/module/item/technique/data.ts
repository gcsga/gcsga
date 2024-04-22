import {
	AbstractContainerSource,
	AbstractContainerSystemData,
	AbstractContainerSystemSource,
} from "@item/abstract-container/data.ts"
import { ItemType } from "@module/data/constants.ts"
import { FeatureObj, PrereqListObj, SkillDefaultObj, Study } from "@system"
import { difficulty, study } from "@util"

type TechniqueSource = AbstractContainerSource<ItemType.Technique, TechniqueSystemSource>

interface TechniqueSystemSource extends AbstractContainerSystemSource {
	type: ItemType.Technique
	name: string
	reference: string
	reference_highlight: string
	notes: string
	vtt_notes: string
	tags: string[]
	tech_level: string
	difficulty: difficulty.Level.Average | difficulty.Level.Hard
	points: number
	default: SkillDefaultObj
	defaults: SkillDefaultObj[]
	limit: number
	limited: boolean
	prereqs: PrereqListObj
	features: FeatureObj[]
	study: Study[]
	study_hours_needed: study.Level | ""
}

interface TechniqueSystemData extends TechniqueSystemSource, AbstractContainerSystemData {}

export type { TechniqueSource, TechniqueSystemData, TechniqueSystemSource }
