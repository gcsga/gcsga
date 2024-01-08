import { ItemGCSSource, ItemGCSSystemData } from "@item/gcs"
import { SpellCalcValues } from "@item/spell"
import { ItemType, } from "@module/data"
import { PrereqList } from "@prereq"
import { Study } from "@util"
import { difficulty, study } from "@util/enum"

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
	college: Array<string>
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
