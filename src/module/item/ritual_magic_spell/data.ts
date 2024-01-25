import { ItemGCSSource, ItemGCSSystemData } from "@item/gcs/data.ts"
import { SpellCalcValues } from "@item/spell/data.ts"
import { ItemType } from "@module/data/misc.ts"
import { PrereqList } from "@prereq/prereq_list.ts"
import { difficulty } from "@util/enum/difficulty.ts"
import { study } from "@util/enum/study.ts"
import { Study } from "@util/study.ts"

export type RitualMagicSpellSource = ItemGCSSource<ItemType.RitualMagicSpell, RitualMagicSpellSystemData>

export interface RitualMagicSpellData extends Omit<RitualMagicSpellSource, "effects">, RitualMagicSpellSystemData {
	readonly type: RitualMagicSpellSource["type"]
	data: RitualMagicSpellSystemData

	readonly _source: RitualMagicSpellSource
}

export interface RitualMagicSpellSystemData extends ItemGCSSystemData {
	prereqs: PrereqList
	difficulty: difficulty.Level
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
	base_skill: string
	prereq_count: number
	study: Study[]
	study_hours_needed: study.Level
	calc?: SpellCalcValues
}
