import {
	AbstractContainerSource,
	AbstractContainerSystemData,
	AbstractContainerSystemSchema,
} from "@item/abstract-container/data.ts"
import { ItemType, gid } from "@module/data/constants.ts"
import { SkillDifficulty } from "@module/data/types.ts"
import { FeatureObj, PrereqList, SkillDefault, SkillDefaultSchema, Study } from "@system"
import { LocalizeGURPS, TooltipGURPS, difficulty, study } from "@util"
import { SkillGURPS } from "./document.ts"
import fields = foundry.data.fields
import { PrereqListSchema } from "@system/prereq/prereq-list.ts"

class SkillSystemData extends AbstractContainerSystemData<SkillGURPS, SkillSystemSchema> {
	static override defineSchema(): SkillSystemSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, initial: ItemType.Skill }),
			name: new fields.StringField({
				required: true,
				initial: LocalizeGURPS.translations.TYPES.Item[ItemType.Skill],
			}),
			reference: new fields.StringField(),
			reference_highlight: new fields.StringField(),
			notes: new fields.StringField(),
			vtt_notes: new fields.StringField(),
			tags: new fields.ArrayField(new foundry.data.fields.StringField()),
			specialization: new fields.StringField(),
			tech_level: new fields.StringField(),
			tech_level_required: new fields.BooleanField(),
			difficulty: new fields.StringField({ initial: `${gid.Dexterity}/${difficulty.Level.Average}`, required: true }),
			points: new fields.NumberField({ integer: true, min: 0 }),
			encumbrance_penalty_multiplier: new fields.NumberField({ integer: true, min: 0, max: 9, initial: 0 }),
			defaulted_from: new fields.SchemaField(SkillDefault.defineSchema()),
			defaults: new fields.ArrayField(new fields.SchemaField(SkillDefault.defineSchema())),
			prereqs: new fields.SchemaField(PrereqList.defineSchema()),
			features: new fields.ArrayField(new fields.ObjectField<FeatureObj>()),
			study: new fields.ArrayField(new fields.ObjectField<Study>()),
			study_hours_needed: new fields.StringField<study.Level>({
				choices: study.Levels,
				initial: study.Level.Standard,
			}),
		}


	}
}

interface SkillSystemData extends AbstractContainerSystemData<SkillGURPS, SkillSystemSchema>, ModelPropsFromSchema<SkillSystemSchema> { }

type SkillSystemSchema = AbstractContainerSystemSchema & {
	type: fields.StringField<ItemType.Skill, ItemType.Skill, true, false, true>
	name: fields.StringField<string, string, true, false, true>
	reference: fields.StringField
	reference_highlight: fields.StringField
	notes: fields.StringField
	vtt_notes: fields.StringField
	tags: fields.ArrayField<fields.StringField>
	specialization: fields.StringField
	tech_level: fields.StringField
	tech_level_required: fields.BooleanField
	difficulty: fields.StringField<SkillDifficulty, SkillDifficulty, true>
	points: fields.NumberField
	encumbrance_penalty_multiplier: fields.NumberField<number, number, true, false, true>
	defaulted_from: fields.SchemaField<SkillDefaultSchema>
	defaults: fields.ArrayField<fields.SchemaField<SkillDefaultSchema>>
	prereqs: fields.SchemaField<PrereqListSchema>
	features: fields.ArrayField<fields.ObjectField<FeatureObj>>
	study: fields.ArrayField<fields.ObjectField<Study>>
	study_hours_needed: fields.StringField<study.Level>
}

type SkillSystemSource = SourceFromSchema<SkillSystemSchema>

type SkillSource = AbstractContainerSource<ItemType.Skill, SkillSystemSource>

interface SkillLevel {
	level: number
	relativeLevel: number
	tooltip: TooltipGURPS
}

export type { SkillLevel, SkillSource, SkillSystemData, SkillSystemSource }
