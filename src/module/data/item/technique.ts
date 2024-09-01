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
import { SkillDefaultSchema, SkillDefault, Study } from "@system"
import { TechniqueDifficulty } from "../types.ts"
import { difficulty } from "@util"
import { calculateTechniqueLevel } from "./helpers.ts"

class TechniqueData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	PrereqTemplate,
	ContainerTemplate,
	FeatureTemplate,
	StudyTemplate,
	ReplacementTemplate,
	AbstractSkillTemplate,
) {
	static override weaponTypes = new Set([ItemType.WeaponMelee, ItemType.WeaponRanged])

	static override defineSchema(): TechniqueSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			difficulty: new fields.StringField({
				required: true,
				nullable: false,
				initial: difficulty.Level.Average,
			}),
			default: new fields.SchemaField(SkillDefault.defineSchema(), {
				required: true,
				nullable: true,
			}),
			defaulted_from: new fields.SchemaField(SkillDefault.defineSchema(), {
				required: true,
				nullable: true,
			}),
			defaults: new fields.ArrayField(new fields.SchemaField(SkillDefault.defineSchema())),
			limit: new fields.NumberField({
				required: true,
				nullable: true,
				integer: true,
				initial: null,
			}),
			limited: new fields.BooleanField({
				required: true,
				nullable: false,
				initial: false,
			}),
		}) as TechniqueSchema
	}

	override calculateLevel(excludes: Set<string> = new Set()) {
		const def = this.default ?? new SkillDefault({}, { parent: this.parent })

		return calculateTechniqueLevel(
			this.parent.actor,
			this.nameableReplacements,
			this.nameWithReplacements,
			this.specializationWithReplacements,
			this.tags,
			def,
			this.difficulty,
			this.points,
			true,
			this.limit,
			excludes,
		)
	}
}

interface TechniqueData extends Omit<ModelPropsFromSchema<TechniqueSchema>, "study" | "defualt" | "defaults"> {
	study: Study[]
	default: SkillDefault
	defaults: SkillDefault[]
}

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
		defaulted_from: fields.SchemaField<
			SkillDefaultSchema,
			SourceFromSchema<SkillDefaultSchema>,
			ModelPropsFromSchema<SkillDefaultSchema>,
			true,
			true
		>
		defaults: fields.ArrayField<fields.SchemaField<SkillDefaultSchema>>
		limit: fields.NumberField<number, number, true, true, true>
		limited: fields.BooleanField<boolean, boolean, true, false, true>
	}

export { TechniqueData, type TechniqueSchema }
