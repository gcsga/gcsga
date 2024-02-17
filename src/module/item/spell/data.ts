import { ItemType, SkillDifficulty } from "@data"
import { BaseContainerSource } from "@item/container/data.ts"
import { ItemGCSSystemSource } from "@item/gcs/data.ts"
import { PrereqListObj } from "@prereq/data.ts"
import { study } from "@util/enum/study.ts"
import { Study } from "@util/study.ts"

export type SpellSource = BaseContainerSource<ItemType.Spell, SpellSystemSource>

export interface SpellSystemSource extends ItemGCSSystemSource {
	type: ItemType.Spell
	name: string
	reference: string
	reference_highlight: string
	notes: string
	vtt_notes: string
	tags: string[]
	tech_level: string
	tech_level_required: boolean
	difficulty: SkillDifficulty
	college: string[]
	power_source: string
	spell_class: string
	resist: string
	casting_cost: string
	maintenance_cost: string
	casting_time: string
	duration: string
	points: number
	prereqs: PrereqListObj
	study: Study[]
	study_hours_needed: study.Level | ""
}
