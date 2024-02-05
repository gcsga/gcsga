import { ItemType } from "@data"
import { FeatureObj } from "@feature/index.ts"
import { BaseContainerSource } from "@item/container/data.ts"
import { ItemGCSSystemSource } from "@item/gcs/data.ts"
import { PrereqListObj } from "@prereq/data.ts"
import { SkillDefaultObj } from "@sytem/default/index.ts"
import { difficulty } from "@util/enum/difficulty.ts"
import { study } from "@util/enum/study.ts"
import { Study } from "@util/study.ts"

export type TechniqueSource = BaseContainerSource<ItemType.Technique, TechniqueSystemSource>

export interface TechniqueSystemSource extends ItemGCSSystemSource {
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
	limit: number
	limited: boolean
	prereqs: PrereqListObj
	features: FeatureObj[]
	study: Study[]
	study_hours_needed: study.Level | ""
}
