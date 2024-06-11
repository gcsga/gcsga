import {
	AbstractContainerSource,
	AbstractContainerSystemData,
	AbstractContainerSystemSource,
} from "@item/abstract-container/data.ts"
import { ItemType } from "@module/data/constants.ts"
import { SkillDifficulty } from "@module/data/types.ts"
import { PrereqListObj, Study } from "@system"
import { study } from "@util"

type SpellSource = AbstractContainerSource<ItemType.Spell, SpellSystemSource>

interface SpellSystemSource extends AbstractContainerSystemSource {
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

interface SpellSystemData extends SpellSystemSource, AbstractContainerSystemData {}

export type { SpellSource, SpellSystemData, SpellSystemSource }
