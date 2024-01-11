import { ItemGCSSource, ItemGCSSystemData } from "@item/gcs"
import { EncumbrancePenaltyMultiplier } from "@item/skill"
import { Feature } from "@module/config"
import { ItemType, } from "@module/data"
import { SkillDefault } from "@module/default"
import { PrereqList } from "@prereq"
import { Study } from "@util"
import { difficulty, study } from "@util/enum"

export type TechniqueSource = ItemGCSSource<ItemType.Technique, TechniqueSystemData>

// Export class TechniqueData extends BaseItemDataGURPS<TechniqueGURPS> {}

export interface TechniqueData extends Omit<TechniqueSource, "effects">, TechniqueSystemData {
	readonly type: TechniqueSource["type"]
	data: TechniqueSystemData

	readonly _source: TechniqueSource
}

export interface TechniqueSystemData extends ItemGCSSystemData {
	prereqs: PrereqList
	tech_level: string
	encumbrance_penalty_multiplier: EncumbrancePenaltyMultiplier
	difficulty: typeof difficulty.TechiqueLevels[number]
	points: number
	defaulted_from: SkillDefault | null
	defaults: SkillDefault[]
	features: Feature[]
	default: SkillDefault
	limit: number
	limited: boolean
	study: Study[]
	study_hours_needed: study.Level
}
