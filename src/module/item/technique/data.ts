import {
	AbstractContainerSource,
	AbstractContainerSystemData,
	AbstractContainerSystemSchema,
} from "@item/abstract-container/data.ts"
import { ItemType } from "@module/data/constants.ts"
import { FeatureObj, PrereqList, SkillDefault, SkillDefaultSchema, Study } from "@system"
import { LocalizeGURPS, difficulty, study } from "@util"
import { TechniqueGURPS } from "./document.ts"
import fields = foundry.data.fields
import { TechniqueDifficulty } from "@module/data/types.ts"
import { PrereqListSchema } from "@system/prereq/prereq-list.ts"


class TechniqueSystemData extends AbstractContainerSystemData<TechniqueGURPS, TechniqueSystemSchema> {
	static override defineSchema(): TechniqueSystemSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, initial: ItemType.Technique }),
			name: new fields.StringField({
				required: true,
				initial: LocalizeGURPS.translations.TYPES.Item[ItemType.Technique],
			}),
			reference: new fields.StringField(),
			reference_highlight: new fields.StringField(),
			notes: new fields.StringField(),
			vtt_notes: new fields.StringField(),
			tags: new fields.ArrayField(new foundry.data.fields.StringField()),
			difficulty: new fields.StringField({ initial: difficulty.Level.Average, required: true }),
			points: new fields.NumberField({ integer: true, min: 0 }),
			default: new fields.SchemaField(SkillDefault.defineSchema()),
			defaults: new fields.ArrayField(new fields.SchemaField(SkillDefault.defineSchema())),
			limit: new fields.NumberField({ integer: true, initial: 0 }),
			limited: new fields.BooleanField({ initial: false }),
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

interface TechniqueSystemData extends AbstractContainerSystemData<TechniqueGURPS, TechniqueSystemSchema>, ModelPropsFromSchema<TechniqueSystemSchema> { }

type TechniqueSystemSchema = AbstractContainerSystemSchema & {
	type: fields.StringField<ItemType.Technique, ItemType.Technique, true, false, true>
	name: fields.StringField<string, string, true, false, true>
	reference: fields.StringField
	reference_highlight: fields.StringField
	notes: fields.StringField
	vtt_notes: fields.StringField
	tags: fields.ArrayField<fields.StringField>
	difficulty: fields.StringField<TechniqueDifficulty, TechniqueDifficulty, true>
	points: fields.NumberField
	default: fields.SchemaField<SkillDefaultSchema>
	defaults: fields.ArrayField<fields.SchemaField<SkillDefaultSchema>>
	limit: fields.NumberField
	limited: fields.BooleanField
	prereqs: fields.SchemaField<PrereqListSchema>
	features: fields.ArrayField<fields.ObjectField<FeatureObj>>
	study: fields.ArrayField<fields.ObjectField<Study>>
	study_hours_needed: fields.StringField<study.Level>
}

type TechniqueSystemSource = SourceFromSchema<TechniqueSystemSchema>

type TechniqueSource = AbstractContainerSource<ItemType.Technique, TechniqueSystemSource>

export type { TechniqueSource, TechniqueSystemData, TechniqueSystemSource }
