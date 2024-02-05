import { ItemGCSSource, ItemGCSSystemSource } from "@item/gcs/data.ts"
import { ItemType } from "@item/types.ts"
import { PrereqListObj } from "@prereq/data.ts"
import { difficulty } from "@util/enum/difficulty.ts"
import { study } from "@util/enum/study.ts"
import { Study } from "@util/study.ts"

export type RitualMagicSpellSource = ItemGCSSource<ItemType.RitualMagicSpell, RitualMagicSpellSystemSource>

export interface RitualMagicSpellSystemSource extends ItemGCSSystemSource {
	type: ItemType.RitualMagicSpell
	name: string
	reference: string
	reference_highlight: string
	notes: string
	vtt_notes: string
	tags: string[]
	tech_level: string
	tech_level_required: boolean
	difficulty: difficulty.Level
	college: string[]
	power_source: string
	spell_class: string
	resist: string
	casting_cost: string
	maintenance_cost: string
	casting_time: string
	duration: string
	base_skill: string
	prereq_count: number
	points: number
	prereqs: PrereqListObj
	study: Study[]
	study_hours_needed: study.Level | ""
}
