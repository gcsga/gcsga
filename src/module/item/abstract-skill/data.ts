import { AbstractContainerSystemData, AbstractContainerSystemSchema } from "@item/abstract-container/data.ts"
import fields = foundry.data.fields
import { Study } from "@system"
import { study } from "@util"
import { AbstractSkillGURPS } from "./document.ts"

class AbstractSkillSystemData<
	TParent extends AbstractSkillGURPS,
	TSchema extends AbstractSkillSystemSchema = AbstractSkillSystemSchema,
> extends AbstractContainerSystemData<TParent, TSchema> {
	static override defineSchema(): AbstractSkillSystemSchema {
		const fields = foundry.data.fields
		return {
			...super.defineSchema(),
			reference: new fields.StringField(),
			reference_highlight: new fields.StringField(),
			notes: new fields.StringField(),
			vtt_notes: new fields.StringField(),
			tags: new fields.ArrayField(new foundry.data.fields.StringField()),
			tech_level: new fields.StringField(),
			tech_level_required: new fields.BooleanField(),
			points: new fields.NumberField({ integer: true, min: 0 }),
			study: new fields.ArrayField(new fields.ObjectField<Study>()),
			study_hours_needed: new fields.StringField<study.Level>({
				choices: study.Levels,
				initial: study.Level.Standard,
			}),
		}
	}
}

type AbstractSkillSystemSchema = AbstractContainerSystemSchema & {
	reference: fields.StringField
	reference_highlight: fields.StringField
	notes: fields.StringField
	vtt_notes: fields.StringField
	tags: fields.ArrayField<fields.StringField>
	tech_level: fields.StringField
	tech_level_required: fields.BooleanField
	points: fields.NumberField<number, number, true, false>
	study: fields.ArrayField<fields.ObjectField<Study>>
	study_hours_needed: fields.StringField<study.Level>
}

export { AbstractSkillSystemData, type AbstractSkillSystemSchema }
