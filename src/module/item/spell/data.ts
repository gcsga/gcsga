import { ItemGCSCalcValues, ItemGCSSource, ItemGCSSystemData } from "@item/gcs/data.ts"
import { ItemType } from "@module/data/misc.ts"
import { PrereqList } from "@prereq/prereq_list.ts"
import { difficulty } from "@util/enum/difficulty.ts"
import { study } from "@util/enum/study.ts"
import { Study } from "@util/study.ts"

export type SpellSource = ItemGCSSource<ItemType.Spell, SpellSystemData>

// Export class SpellData extends BaseItemDataGURPS<SpellGURPS> {}

export interface SpellData extends Omit<SpellSource, "effects">, SpellSystemData {
	readonly type: SpellSource["type"]
	data: SpellSystemData

	readonly _source: SpellSource
}

export interface SpellSystemData extends ItemGCSSystemData {
	prereqs: PrereqList
	difficulty: `${string}/${difficulty.Level}`
	tech_level: string
	tech_level_required: boolean
	college: Array<string>
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
	calc?: SpellCalcValues
}

export interface SpellCalcValues extends ItemGCSCalcValues {
	level: number
	rsl: string
	points?: number
}
