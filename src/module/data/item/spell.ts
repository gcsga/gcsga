import { ItemDataModel } from "../abstract.ts"
import fields = foundry.data.fields
import { PrereqTemplate, PrereqTemplateSchema } from "./templates/prereqs.ts"
import { ContainerTemplate, ContainerTemplateSchema } from "./templates/container.ts"
import { StudyTemplate, StudyTemplateSchema } from "./templates/study.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import { ItemType, gid } from "../constants.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { AbstractSkillTemplate, AbstractSkillTemplateSchema } from "./templates/abstract-skill.ts"
import { AttributeDifficulty, AttributeDifficultySchema } from "./fields/attribute-difficulty.ts"
import { difficulty } from "@util"

class SpellData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	PrereqTemplate,
	ContainerTemplate,
	StudyTemplate,
	ReplacementTemplate,
	AbstractSkillTemplate,
) {
	static override weaponTypes = new Set([ItemType.MeleeWeapon, ItemType.RangedWeapon])

	static override defineSchema(): SpellSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			difficulty: new fields.SchemaField<AttributeDifficultySchema>(AttributeDifficulty.defineSchema(), {
				required: true,
				nullable: false,
				initial: { attribute: gid.Intelligence, difficulty: difficulty.Level.Hard },
			}),
			college: new fields.ArrayField<fields.StringField>(new foundry.data.fields.StringField()),
			power_source: new fields.StringField<string, string, true, false, true>({
				required: true,
				nullable: false,
				initial: "Arcane",
			}),
			spell_class: new fields.StringField<string, string, true, false, true>({
				required: true,
				nullable: false,
				initial: "Regular",
			}),
			resist: new fields.StringField<string, string, true, false, true>({
				required: true,
				nullable: false,
				initial: "",
			}),
			casting_cost: new fields.StringField<string, string, true, false, true>({
				required: true,
				nullable: false,
				initial: "1",
			}),
			maintenance_cost: new fields.StringField<string, string, true, false, true>({
				required: true,
				nullable: false,
				initial: "",
			}),
			casting_time: new fields.StringField<string, string, true, false, true>({
				required: true,
				nullable: false,
				initial: "1 sec",
			}),
			duration: new fields.StringField<string, string, true, false, true>({
				required: true,
				nullable: false,
				initial: "Instant",
			}),
		}) as SpellSchema
	}
}

interface SpellData extends ModelPropsFromSchema<SpellSchema> {}

type SpellSchema = BasicInformationTemplateSchema &
	PrereqTemplateSchema &
	ContainerTemplateSchema &
	StudyTemplateSchema &
	ReplacementTemplateSchema &
	AbstractSkillTemplateSchema & {
		difficulty: fields.SchemaField<AttributeDifficultySchema>
		college: fields.ArrayField<fields.StringField>
		power_source: fields.StringField<string, string, true, false, true>
		spell_class: fields.StringField<string, string, true, false, true>
		resist: fields.StringField<string, string, true, false, true>
		casting_cost: fields.StringField<string, string, true, false, true>
		maintenance_cost: fields.StringField<string, string, true, false, true>
		casting_time: fields.StringField<string, string, true, false, true>
		duration: fields.StringField<string, string, true, false, true>
	}

export { SpellData, type SpellSchema }
