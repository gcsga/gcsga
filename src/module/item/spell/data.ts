import { AbstractContainerSource } from "@item/abstract-container/data.ts"
import { ItemType, NumericCompareType, gid } from "@module/data/constants.ts"
import { SkillDifficulty } from "@module/data/types.ts"
import { BasePrereq, Prereq } from "@system"
import { TooltipGURPS, difficulty, prereq } from "@util"
import { SpellGURPS } from "./document.ts"
import fields = foundry.data.fields
import { AbstractSkillSystemData, AbstractSkillSystemSchema } from "@item/abstract-skill/data.ts"
import { RecordField } from "@system/schema-data-fields.ts"

class SpellSystemData extends AbstractSkillSystemData<SpellGURPS, SpellSystemSchema> {
	static override defineSchema(): SpellSystemSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, initial: ItemType.Spell }),
			name: new fields.StringField({
				required: true,
			}),
			difficulty: new fields.StringField({
				initial: `${gid.Intelligence}/${difficulty.Level.Hard}`,
				required: true,
			}),
			college: new fields.ArrayField(new foundry.data.fields.StringField()),
			power_source: new fields.StringField(),
			spell_class: new fields.StringField(),
			resist: new fields.StringField(),
			casting_cost: new fields.StringField(),
			maintenance_cost: new fields.StringField(),
			casting_time: new fields.StringField(),
			duration: new fields.StringField(),
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

interface SpellSystemData
	extends AbstractSkillSystemData<SpellGURPS, SpellSystemSchema>,
		ModelPropsFromSchema<SpellSystemSchema> {}

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
	prereqs: fields.ArrayField<fields.TypedSchemaField<Record<prereq.Type, ConstructorOf<Prereq>>>>
	replacements: RecordField<
		fields.StringField<string, string, true, false, false>,
		fields.StringField<string, string, true, false, false>
	>
}

type SpellSystemSource = SourceFromSchema<SpellSystemSchema>

type SpellSource = AbstractContainerSource<ItemType.Spell, SpellSystemSource>

interface SpellLevel {
	level: number
	relativeLevel: number
	tooltip: TooltipGURPS
}

export type { SpellLevel, SpellSource, SpellSystemSource }
export { SpellSystemData }
