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
import { AttributeDifficulty, AttributeDifficultySchema } from "./fields/attribute-difficulty.ts"
import { TooltipGURPS } from "@util"

class SkillData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	PrereqTemplate,
	ContainerTemplate,
	FeatureTemplate,
	StudyTemplate,
	ReplacementTemplate,
	AbstractSkillTemplate,
) {
	static override weaponTypes = new Set([ItemType.MeleeWeapon, ItemType.RangedWeapon])

	static override defineSchema(): SkillSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			specialization: new fields.StringField<string, string, true>({
				required: true,
				nullable: false,
				initial: "",
			}),
			difficulty: new fields.SchemaField<AttributeDifficultySchema>(AttributeDifficulty.defineSchema()),
			encumbrance_penalty_multiplier: new fields.NumberField<number, number, true, false, true>({
				integer: true,
				min: 0,
				max: 9,
				initial: 0,
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
		}) as SkillSchema
	}

	override calculateLevel() {
		return (this._skillLevel ??= { level: 0, relativeLevel: 0, tooltip: new TooltipGURPS() })
	}
}

interface SkillData extends ModelPropsFromSchema<SkillSchema> {}

type SkillSchema = BasicInformationTemplateSchema &
	PrereqTemplateSchema &
	ContainerTemplateSchema &
	FeatureTemplateSchema &
	StudyTemplateSchema &
	ReplacementTemplateSchema &
	AbstractSkillTemplateSchema & {
		specialization: fields.StringField<string, string, true, false, true>
		difficulty: fields.SchemaField<AttributeDifficultySchema>
		encumbrance_penalty_multiplier: fields.NumberField<number, number, true, false, true>
		default: fields.SchemaField<
			SkillDefaultSchema,
			SourceFromSchema<SkillDefaultSchema>,
			ModelPropsFromSchema<SkillDefaultSchema>,
			true,
			true
		>
		defaults: fields.ArrayField<fields.SchemaField<SkillDefaultSchema>>
	}

export { SkillData, type SkillSchema }
