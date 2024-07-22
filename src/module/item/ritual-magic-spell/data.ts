import { AbstractContainerSource, } from "@item/abstract-container/data.ts"
import fields = foundry.data.fields
import { ItemType, } from "@module/data/constants.ts"
import { PrereqList, PrereqListSchema } from "@system"
import { LocalizeGURPS, difficulty } from "@util"
import { TechniqueDifficulty } from "@module/data/types.ts"
import { RitualMagicSpellGURPS } from "./document.ts"
import { AbstractSkillSystemData, AbstractSkillSystemSchema } from "@item/abstract-skill/data.ts"

class RitualMagicSpellSystemData extends AbstractSkillSystemData<RitualMagicSpellGURPS, RitualMagicSpellSystemSchema> {
	static override defineSchema(): RitualMagicSpellSystemSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, initial: ItemType.RitualMagicSpell }),
			name: new fields.StringField({
				required: true,
				initial: LocalizeGURPS.translations.TYPES.Item[ItemType.RitualMagicSpell],
			}),
			difficulty: new fields.StringField({ initial: difficulty.Level.Hard, required: true }),
			college: new fields.ArrayField(new foundry.data.fields.StringField()),
			power_source: new fields.StringField(),
			spell_class: new fields.StringField(),
			resist: new fields.StringField(),
			casting_cost: new fields.StringField(),
			maintenance_cost: new fields.StringField(),
			casting_time: new fields.StringField(),
			duration: new fields.StringField(),
			base_skill: new fields.StringField(),
			prereq_count: new fields.NumberField({ integer: true, min: 0, nullable: false, initial: 0 }),
			prereqs: new fields.SchemaField(PrereqList.defineSchema()),
		}


	}
}

interface RitualMagicSpellSystemData extends AbstractSkillSystemData<RitualMagicSpellGURPS, RitualMagicSpellSystemSchema>, ModelPropsFromSchema<RitualMagicSpellSystemSchema> { }

type RitualMagicSpellSystemSchema = AbstractSkillSystemSchema & {
	name: fields.StringField<string, string, true, false, true>
	type: fields.StringField<ItemType.RitualMagicSpell, ItemType.RitualMagicSpell, true, false, true>
	difficulty: fields.StringField<TechniqueDifficulty, TechniqueDifficulty, true>
	college: fields.ArrayField<fields.StringField>
	power_source: fields.StringField
	spell_class: fields.StringField
	resist: fields.StringField
	casting_cost: fields.StringField
	maintenance_cost: fields.StringField
	casting_time: fields.StringField
	duration: fields.StringField
	base_skill: fields.StringField
	prereq_count: fields.NumberField<number, number, true, false>
	prereqs: fields.SchemaField<PrereqListSchema>
}

type RitualMagicSpellSystemSource = SourceFromSchema<RitualMagicSpellSystemSchema>

type RitualMagicSpellSource = AbstractContainerSource<ItemType.RitualMagicSpell, RitualMagicSpellSystemSource>

export type { RitualMagicSpellSource, RitualMagicSpellSystemSource }
export { RitualMagicSpellSystemData }
