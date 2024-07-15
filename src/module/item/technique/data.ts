import {
	AbstractContainerSource,
} from "@item/abstract-container/data.ts"
import { ItemType } from "@module/data/constants.ts"
import { FeatureObj, PrereqList, SkillDefault, SkillDefaultSchema, } from "@system"
import { LocalizeGURPS, difficulty, } from "@util"
import { TechniqueGURPS } from "./document.ts"
import fields = foundry.data.fields
import { TechniqueDifficulty } from "@module/data/types.ts"
import { PrereqListSchema } from "@system/prereq/prereq-list.ts"
import { AbstractSkillSystemData, AbstractSkillSystemSchema } from "@item/abstract-skill/data.ts"


class TechniqueSystemData extends AbstractSkillSystemData<TechniqueGURPS, TechniqueSystemSchema> {
	static override defineSchema(): TechniqueSystemSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, initial: ItemType.Technique }),
			name: new fields.StringField({
				required: true,
				initial: LocalizeGURPS.translations.TYPES.Item[ItemType.Technique],
			}),
			difficulty: new fields.StringField({ initial: difficulty.Level.Average, required: true }),
			points: new fields.NumberField({ integer: true, min: 0 }),
			default: new fields.SchemaField(SkillDefault.defineSchema()),
			defaults: new fields.ArrayField(new fields.SchemaField(SkillDefault.defineSchema())),
			limit: new fields.NumberField({ integer: true, initial: 0 }),
			limited: new fields.BooleanField({ initial: false }),
			prereqs: new fields.SchemaField(PrereqList.defineSchema()),
			features: new fields.ArrayField(new fields.ObjectField<FeatureObj>()),
		}


	}
}

interface TechniqueSystemData extends AbstractSkillSystemData<TechniqueGURPS, TechniqueSystemSchema>, ModelPropsFromSchema<TechniqueSystemSchema> { }

type TechniqueSystemSchema = AbstractSkillSystemSchema & {
	name: fields.StringField<string, string, true, false, true>
	type: fields.StringField<ItemType.Technique, ItemType.Technique, true, false, true>
	difficulty: fields.StringField<TechniqueDifficulty, TechniqueDifficulty, true>
	default: fields.SchemaField<SkillDefaultSchema>
	defaults: fields.ArrayField<fields.SchemaField<SkillDefaultSchema>>
	limit: fields.NumberField
	limited: fields.BooleanField
	prereqs: fields.SchemaField<PrereqListSchema>
	features: fields.ArrayField<fields.ObjectField<FeatureObj>>
}

type TechniqueSystemSource = SourceFromSchema<TechniqueSystemSchema>

type TechniqueSource = AbstractContainerSource<ItemType.Technique, TechniqueSystemSource>

export type { TechniqueSource, TechniqueSystemData, TechniqueSystemSource }
