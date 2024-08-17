import { AbstractContainerSource } from "@item/abstract-container/data.ts"
import fields = foundry.data.fields
import { ItemType, NumericCompareType } from "@module/data/constants.ts"
import { difficulty, prereq } from "@util"
import { TechniqueDifficulty } from "@module/data/types.ts"
import { RitualMagicSpellGURPS } from "./document.ts"
import { AbstractSkillSystemData, AbstractSkillSystemSchema } from "@item/abstract-skill/data.ts"
import { RecordField } from "@system/schema-data-fields.ts"
import { BasePrereq, Prereq } from "@system"

class RitualMagicSpellSystemData extends AbstractSkillSystemData<RitualMagicSpellGURPS, RitualMagicSpellSystemSchema> {
	static override defineSchema(): RitualMagicSpellSystemSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, initial: ItemType.RitualMagicSpell }),
			name: new fields.StringField({
				required: true,
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
			prereqs: new fields.ArrayField(new fields.TypedSchemaField(BasePrereq.TYPES), {
				initial: [
					{
						type: prereq.Type.List,
						id: "root",
						all: true,
						when_tl: { compare: NumericCompareType.AnyNumber, qualifier: 0 },
						prereqs: [],
					},
				],
			}),
			replacements: new RecordField(
				new fields.StringField({ required: true, nullable: false }),
				new fields.StringField({ required: true, nullable: false }),
			),
		}
	}
}

interface RitualMagicSpellSystemData
	extends AbstractSkillSystemData<RitualMagicSpellGURPS, RitualMagicSpellSystemSchema>,
		ModelPropsFromSchema<RitualMagicSpellSystemSchema> {}

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
	prereqs: fields.ArrayField<fields.TypedSchemaField<Record<prereq.Type, ConstructorOf<Prereq>>>>
	replacements: RecordField<
		fields.StringField<string, string, true, false, false>,
		fields.StringField<string, string, true, false, false>
	>
}

type RitualMagicSpellSystemSource = SourceFromSchema<RitualMagicSpellSystemSchema>

type RitualMagicSpellSource = AbstractContainerSource<ItemType.RitualMagicSpell, RitualMagicSpellSystemSource>

export type { RitualMagicSpellSource, RitualMagicSpellSystemSource }
export { RitualMagicSpellSystemData }
