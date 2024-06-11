import { BaseItemSourceGURPS, ItemSystemData, ItemSystemSource } from "@item/base/data.ts"
import { ItemType } from "@module/data/constants.ts"
import { PrereqListObj, Study } from "@system"
import { difficulty, study } from "@util"

type RitualMagicSpellSource = BaseItemSourceGURPS<ItemType.RitualMagicSpell, RitualMagicSpellSystemSource>

interface RitualMagicSpellSystemSource extends ItemSystemSource {
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

interface RitualMagicSpellSystemData extends RitualMagicSpellSystemSource, ItemSystemData {}

export type { RitualMagicSpellSource, RitualMagicSpellSystemData, RitualMagicSpellSystemSource }
