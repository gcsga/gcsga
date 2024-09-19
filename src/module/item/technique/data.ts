// import { AbstractContainerSource } from "@item/abstract-container/data.ts"
// import { AbstractSkillSystemData, AbstractSkillSystemSchema } from "@item/abstract-skill/data.ts"
// import { ItemType, NumericCompareType } from "@module/data/constants.ts"
// import { TechniqueDifficulty } from "@module/data/types.ts"
// import { BasePrereq, Prereq, SkillDefault, SkillDefaultSchema } from "@system"
// import { difficulty, feature, prereq } from "@util"
// import { TechniqueGURPS } from "./document.ts"
// import fields = foundry.data.fields
// import { RecordField } from "@system/schema-data-fields.ts"
// import { Feature, FeatureTypes } from "@system/feature/types.ts"
//
// class TechniqueSystemData extends AbstractSkillSystemData<TechniqueGURPS, TechniqueSystemSchema> {
// 	static override defineSchema(): TechniqueSystemSchema {
// 		const fields = foundry.data.fields
//
// 		return {
// 			...super.defineSchema(),
// 			type: new fields.StringField({ required: true, initial: ItemType.Technique }),
// 			name: new fields.StringField({
// 				required: true,
// 			}),
// 			difficulty: new fields.StringField({ initial: difficulty.Level.Average, required: true }),
// 			points: new fields.NumberField({ integer: true, min: 0 }),
// 			default: new fields.EmbeddedDataField(SkillDefault),
// 			defaults: new fields.ArrayField(new fields.EmbeddedDataField(SkillDefault)),
// 			limit: new fields.NumberField({ integer: true, initial: 0 }),
// 			limited: new fields.BooleanField({ initial: false }),
// 			prereqs: new fields.ArrayField(new fields.TypedSchemaField(BasePrereq.TYPES), {
// 				initial: [
// 					{
// 						type: prereq.Type.List,
// 						id: "root",
// 						all: true,
// 						when_tl: { compare: NumericCompareType.AnyNumber, qualifier: 0 },
// 						prereqs: [],
// 					},
// 				],
// 			}),
// 			features: new fields.ArrayField(new fields.TypedSchemaField(FeatureTypes)),
// 			replacements: new RecordField(
// 				new fields.StringField({ required: true, nullable: false }),
// 				new fields.StringField({ required: true, nullable: false }),
// 			),
// 		}
// 	}
// }
//
// interface TechniqueSystemData
// 	extends AbstractSkillSystemData<TechniqueGURPS, TechniqueSystemSchema>,
// 		ModelPropsFromSchema<TechniqueSystemSchema> {}
//
// type TechniqueSystemSchema = AbstractSkillSystemSchema & {
// 	name: fields.StringField<string, string, true, false, true>
// 	type: fields.StringField<ItemType.Technique, ItemType.Technique, true, false, true>
// 	difficulty: fields.StringField<TechniqueDifficulty, TechniqueDifficulty, true>
// 	default: fields.SchemaField<SkillDefaultSchema>
// 	defaults: fields.ArrayField<fields.SchemaField<SkillDefaultSchema>>
// 	limit: fields.NumberField
// 	limited: fields.BooleanField
// 	prereqs: fields.ArrayField<fields.TypedSchemaField<Record<prereq.Type, ConstructorOf<Prereq>>>>
// 	features: fields.ArrayField<fields.TypedSchemaField<Record<feature.Type, ConstructorOf<Feature>>>>
// 	replacements: RecordField<
// 		fields.StringField<string, string, true, false, false>,
// 		fields.StringField<string, string, true, false, false>
// 	>
// }
//
// type TechniqueSystemSource = SourceFromSchema<TechniqueSystemSchema>
//
// type TechniqueSource = AbstractContainerSource<ItemType.Technique, TechniqueSystemSource>
//
// export type { TechniqueSource, TechniqueSystemSource }
// export { TechniqueSystemData }
