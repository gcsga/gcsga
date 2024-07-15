import {
	AbstractContainerSource,
} from "@item/abstract-container/data.ts"
import { ItemType, gid } from "@module/data/constants.ts"
import { SkillDifficulty } from "@module/data/types.ts"
import { PrereqList, } from "@system"
import { LocalizeGURPS, TooltipGURPS, difficulty, } from "@util"
import { SpellGURPS } from "./document.ts"
import fields = foundry.data.fields
import { PrereqListSchema } from "@system/prereq/prereq-list.ts"
import { AbstractSkillSystemData, AbstractSkillSystemSchema } from "@item/abstract-skill/data.ts"

class SpellSystemData extends AbstractSkillSystemData<SpellGURPS, SpellSystemSchema> {
	static override defineSchema(): SpellSystemSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, initial: ItemType.Spell }),
			name: new fields.StringField({
				required: true,
				initial: LocalizeGURPS.translations.TYPES.Item[ItemType.Spell],
			}),
			difficulty: new fields.StringField({ initial: `${gid.Intelligence}/${difficulty.Level.Hard}`, required: true }),
			college: new fields.ArrayField(new foundry.data.fields.StringField()),
			power_source: new fields.StringField(),
			spell_class: new fields.StringField(),
			resist: new fields.StringField(),
			casting_cost: new fields.StringField(),
			maintenance_cost: new fields.StringField(),
			casting_time: new fields.StringField(),
			duration: new fields.StringField(),
			prereqs: new fields.SchemaField(PrereqList.defineSchema()),
		}


	}
}

interface SpellSystemData extends AbstractSkillSystemData<SpellGURPS, SpellSystemSchema>, ModelPropsFromSchema<SpellSystemSchema> { }

type SpellSystemSchema = AbstractSkillSystemSchema & {
	name: fields.StringField<string, string, true, false, true>
	type: fields.StringField<ItemType.Spell, ItemType.Spell, true, false, true>
	difficulty: fields.StringField<SkillDifficulty, SkillDifficulty, true>
	college: fields.ArrayField<fields.StringField>
	power_source: fields.StringField
	spell_class: fields.StringField
	resist: fields.StringField
	casting_cost: fields.StringField
	maintenance_cost: fields.StringField
	casting_time: fields.StringField
	duration: fields.StringField
	prereqs: fields.SchemaField<PrereqListSchema>
}

type SpellSystemSource = SourceFromSchema<SpellSystemSchema>

type SpellSource = AbstractContainerSource<ItemType.Spell, SpellSystemSource>

interface SpellLevel {
	level: number
	relativeLevel: number
	tooltip: TooltipGURPS
}

export type { SpellLevel, SpellSource, SpellSystemData, SpellSystemSource }
