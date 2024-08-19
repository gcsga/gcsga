import SystemDataModel from "@module/data/abstract.ts"
import fields = foundry.data.fields

export class BasicInformationTemplate extends SystemDataModel<
	foundry.abstract.Document,
	BasicInformationTemplateSchema
> {
	static override defineSchema(): BasicInformationTemplateSchema {
		const fields = foundry.data.fields
		return {
			name: new fields.StringField({
				required: true,
			}),
			reference: new fields.StringField(),
			reference_highlight: new fields.StringField(),
			notes: new fields.StringField(),
			vtt_notes: new fields.StringField(),
			tags: new fields.ArrayField(new foundry.data.fields.StringField()),
		}
	}
}

export type BasicInformationTemplateSchema = {
	name: fields.StringField<string, string, true, false, true>
	reference: fields.StringField
	reference_highlight: fields.StringField
	notes: fields.StringField
	vtt_notes: fields.StringField
	tags: fields.ArrayField<fields.StringField>
}
