import fields = foundry.data.fields
import { ItemType } from "../constants.ts"
import { difficulty } from "@util"
import { TechniqueDifficulty } from "../types.ts"
import { AbstractSkillTemplate, AbstractSkillTemplateSchema } from "./templates/abstract-skill.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { ContainerTemplate, ContainerTemplateSchema } from "./templates/container.ts"
import { PrereqTemplate, PrereqTemplateSchema } from "./templates/prereqs.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import { StudyTemplate, StudyTemplateSchema } from "./templates/study.ts"
import { ItemDataModel } from "../abstract.ts"

class RitualMagicSpellData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	PrereqTemplate,
	ContainerTemplate,
	StudyTemplate,
	ReplacementTemplate,
	AbstractSkillTemplate,
) {
	static override weaponTypes = new Set([ItemType.MeleeWeapon, ItemType.RangedWeapon])

	static override defineSchema(): RitualMagicSpellSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			difficulty: new fields.StringField<TechniqueDifficulty, TechniqueDifficulty, true, false, true>({
				required: true,
				nullable: false,
				initial: difficulty.Level.Average,
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
			base_skill: new fields.StringField<string, string, true, false, true>({
				required: true,
				nullable: false,
				initial: "Ritual Magic",
			}),
			prereq_count: new fields.NumberField<number, number, true, false, true>({
				required: true,
				nullable: false,
				initial: 0,
			}),
		}) as RitualMagicSpellSchema
	}
}

interface RitualMagicSpellData extends ModelPropsFromSchema<RitualMagicSpellSchema> {}

type RitualMagicSpellSchema = BasicInformationTemplateSchema &
	PrereqTemplateSchema &
	ContainerTemplateSchema &
	StudyTemplateSchema &
	ReplacementTemplateSchema &
	AbstractSkillTemplateSchema & {
		difficulty: fields.StringField<TechniqueDifficulty, TechniqueDifficulty, true, false, true>
		college: fields.ArrayField<fields.StringField>
		power_source: fields.StringField<string, string, true, false, true>
		spell_class: fields.StringField<string, string, true, false, true>
		resist: fields.StringField<string, string, true, false, true>
		casting_cost: fields.StringField<string, string, true, false, true>
		maintenance_cost: fields.StringField<string, string, true, false, true>
		casting_time: fields.StringField<string, string, true, false, true>
		duration: fields.StringField<string, string, true, false, true>
		base_skill: fields.StringField<string, string, true, false, true>
		prereq_count: fields.NumberField<number, number, true, false, true>
	}

export { RitualMagicSpellData, type RitualMagicSpellSchema }
