import { ItemGCSSource, ItemGCSSystemSource } from "@item/gcs/data.ts"
import { ItemType } from "@item/types.ts"
import { PrereqList } from "@prereq/prereq_list.ts"
import { difficulty } from "@util/enum/difficulty.ts"
import { study } from "@util/enum/study.ts"
import { Study } from "@util/study.ts"

export type SpellSource = ItemGCSSource<ItemType.Spell, SpellSystemSource>

export interface SpellSystemSource extends ItemGCSSystemSource {
	prereqs: PrereqList
	difficulty: `${string}/${difficulty.Level}`
	tech_level: string
	tech_level_required: boolean
	college: string[]
	power_source: string
	spell_class: string
	resist: string
	casting_cost: string
	maintenance_cost: string
	casting_time: string
	duration: string
	points: number
	study: Study[]
	study_hours_needed: study.Level
}
