import { AbstractContainerSource, AbstractContainerSystemData, AbstractContainerSystemSchema } from "@item/abstract-container/data.ts"
import fields = foundry.data.fields
import { ItemType, gid } from "@module/data/constants.ts"
import { PrereqList, Study } from "@system"
import { LocalizeGURPS, difficulty, study } from "@util"
import { SkillDifficulty } from "@module/data/types.ts"
import { PrereqListSchema } from "@system/prereq/prereq-list.ts"
import { RitualMagicSpellGURPS } from "./document.ts"

class RitualMagicSpellSystemData extends AbstractContainerSystemData<RitualMagicSpellGURPS, RitualMagicSpellSystemSchema> {
	static override defineSchema(): RitualMagicSpellSystemSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, initial: ItemType.RitualMagicSpell }),
			name: new fields.StringField({
				required: true,
				initial: LocalizeGURPS.translations.TYPES.Item[ItemType.RitualMagicSpell],
			}),
			reference: new fields.StringField(),
			reference_highlight: new fields.StringField(),
			notes: new fields.StringField(),
			vtt_notes: new fields.StringField(),
			tags: new fields.ArrayField(new foundry.data.fields.StringField()),
			tech_level: new fields.StringField(),
			tech_level_required: new fields.BooleanField(),
			difficulty: new fields.StringField({ initial: `${gid.Intelligence}/${difficulty.Level.Hard}`, required: true }),
			college: new fields.ArrayField(new foundry.data.fields.StringField()),
			power_source: new fields.StringField(),
			spell_class: new fields.StringField(),
			resist: new fields.StringField(),
			casting_cost: new fields.StringField(),
			maintenance_cost: new fields.StringField(),
			casting_time: new fields.StringField(),
			duration: new fields.StringField(),
			base_skill: new fields.StringField(),
			prereq_count: new fields.NumberField({ integer: true, min: 0 }),
			points: new fields.NumberField({ integer: true, min: 0 }),
			prereqs: new fields.SchemaField(PrereqList.defineSchema()),
			study: new fields.ArrayField(new fields.ObjectField<Study>()),
			study_hours_needed: new fields.StringField<study.Level>({
				choices: study.Levels,
				initial: study.Level.Standard,
			}),
		}


	}
}

interface RitualMagicSpellSystemData extends AbstractContainerSystemData<RitualMagicSpellGURPS, RitualMagicSpellSystemSchema>, ModelPropsFromSchema<RitualMagicSpellSystemSchema> { }

type RitualMagicSpellSystemSchema = AbstractContainerSystemSchema & {
	type: fields.StringField<ItemType.RitualMagicSpell, ItemType.RitualMagicSpell, true, false, true>
	name: fields.StringField<string, string, true, false, true>
	reference: fields.StringField
	reference_highlight: fields.StringField
	notes: fields.StringField
	vtt_notes: fields.StringField
	tags: fields.ArrayField<fields.StringField>
	tech_level: fields.StringField
	tech_level_required: fields.BooleanField
	difficulty: fields.StringField<SkillDifficulty, SkillDifficulty, true>
	college: fields.ArrayField<fields.StringField>
	power_source: fields.StringField
	spell_class: fields.StringField
	resist: fields.StringField
	casting_cost: fields.StringField
	maintenance_cost: fields.StringField
	casting_time: fields.StringField
	duration: fields.StringField
	base_skill: fields.StringField
	prereq_count: fields.NumberField
	points: fields.NumberField
	prereqs: fields.SchemaField<PrereqListSchema>
	study: fields.ArrayField<fields.ObjectField<Study>>
	study_hours_needed: fields.StringField<study.Level>
}

type RitualMagicSpellSystemSource = SourceFromSchema<RitualMagicSpellSystemSchema>

type RitualMagicSpellSource = AbstractContainerSource<ItemType.RitualMagicSpell, RitualMagicSpellSystemSource>

export type { RitualMagicSpellSource, RitualMagicSpellSystemData, RitualMagicSpellSystemSource }
