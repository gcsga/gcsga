import { SystemDataModel } from "@module/data/abstract.ts"
import fields = foundry.data.fields
import { ItemGURPS2 } from "@module/document/item.ts"

class BasicInformationTemplate extends SystemDataModel<foundry.abstract.Document, BasicInformationTemplateSchema> {
	static override defineSchema(): BasicInformationTemplateSchema {
		const fields = foundry.data.fields
		return {
			container: new fields.ForeignDocumentField(ItemGURPS2, { idOnly: true }),
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

	hasTag(tag: string): boolean {
		return this.tags.includes(tag)
	}

	get combinedTags(): string {
		return this.tags.join(", ")
	}
}

interface BasicInformationTemplate
	extends SystemDataModel<foundry.abstract.Document, BasicInformationTemplateSchema>,
		ModelPropsFromSchema<BasicInformationTemplateSchema> {}

type BasicInformationTemplateSchema = {
	container: fields.ForeignDocumentField<ItemGURPS2>
	name: fields.StringField<string, string, true, false, true>
	reference: fields.StringField
	reference_highlight: fields.StringField
	notes: fields.StringField
	vtt_notes: fields.StringField
	tags: fields.ArrayField<fields.StringField>
}

export { BasicInformationTemplate, type BasicInformationTemplateSchema }
