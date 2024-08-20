import { ItemDataModel } from "../abstract.ts"
import fields = foundry.data.fields
import { PrereqTemplate, PrereqTemplateSchema } from "./templates/prereqs.ts"
import { ContainerTemplate, ContainerTemplateSchema } from "./templates/container.ts"
import { FeatureTemplate, FeatureTemplateSchema } from "./templates/features.ts"
import { StudyTemplate, StudyTemplateSchema } from "./templates/study.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import { ItemType } from "../constants.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { AbstractSkillTemplate, AbstractSkillTemplateSchema } from "./templates/abstract-skill.ts"
import { SkillDefaultSchema, SkillDefault } from "@system"
import { TechniqueDifficulty } from "../types.ts"
import { difficulty } from "@util"

class TechniqueData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	PrereqTemplate,
	ContainerTemplate,
	FeatureTemplate,
	StudyTemplate,
	ReplacementTemplate,
	AbstractSkillTemplate,
) {
	static override weaponTypes = new Set([ItemType.MeleeWeapon, ItemType.RangedWeapon])

	static override defineSchema(): TechniqueSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			difficulty: new fields.StringField<TechniqueDifficulty, TechniqueDifficulty, true, false, true>({
				required: true,
				nullable: false,
				initial: difficulty.Level.Average,
			}),
			default: new fields.SchemaField<
				SkillDefaultSchema,
				SourceFromSchema<SkillDefaultSchema>,
				ModelPropsFromSchema<SkillDefaultSchema>,
				true,
				true
			>(SkillDefault.defineSchema(), {
				required: true,
				nullable: true,
			}),
			defaults: new fields.ArrayField<fields.SchemaField<SkillDefaultSchema>>(
				new fields.SchemaField<SkillDefaultSchema>(SkillDefault.defineSchema()),
			),
			limit: new fields.NumberField<number, number, true, false, true>({
				required: true,
				nullable: false,
				integer: true,
				initial: 0,
			}),
			limited: new fields.BooleanField<boolean, boolean, true, false, true>({
				required: true,
				nullable: false,
				initial: false,
			}),
		}) as TechniqueSchema
	}
}

interface TechniqueData extends ModelPropsFromSchema<TechniqueSchema> {}

type TechniqueSchema = BasicInformationTemplateSchema &
	PrereqTemplateSchema &
	ContainerTemplateSchema &
	FeatureTemplateSchema &
	StudyTemplateSchema &
	ReplacementTemplateSchema &
	AbstractSkillTemplateSchema & {
		difficulty: fields.StringField<TechniqueDifficulty, TechniqueDifficulty, true, false, true>
		default: fields.SchemaField<
			SkillDefaultSchema,
			SourceFromSchema<SkillDefaultSchema>,
			ModelPropsFromSchema<SkillDefaultSchema>,
			true,
			true
		>
		defaults: fields.ArrayField<fields.SchemaField<SkillDefaultSchema>>
		limit: fields.NumberField<number, number, true, false, true>
		limited: fields.BooleanField<boolean, boolean, true, false, true>
	}

export { TechniqueData, type TechniqueSchema }
