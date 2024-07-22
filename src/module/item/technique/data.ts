import {
	AbstractContainerSource,
} from "@item/abstract-container/data.ts"
import { AbstractSkillSystemData, AbstractSkillSystemSchema } from "@item/abstract-skill/data.ts"
import { ItemType } from "@module/data/constants.ts"
import { TechniqueDifficulty } from "@module/data/types.ts"
import { FeatureSchema, PrereqList, PrereqListSchema, SkillDefault, SkillDefaultSchema, } from "@system"
import { LocalizeGURPS, difficulty, } from "@util"
import { TechniqueGURPS } from "./document.ts"
import fields = foundry.data.fields
import { BaseFeature } from "@system/feature/base.ts"


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
			features: new fields.ArrayField(new fields.SchemaField(BaseFeature.defineSchema())),
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
	features: fields.ArrayField<fields.SchemaField<FeatureSchema>>
}

type TechniqueSystemSource = SourceFromSchema<TechniqueSystemSchema>

type TechniqueSource = AbstractContainerSource<ItemType.Technique, TechniqueSystemSource>

export type { TechniqueSource, TechniqueSystemSource }
export { TechniqueSystemData }
