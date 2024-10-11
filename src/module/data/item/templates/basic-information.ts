import { ItemDataModel } from "@module/data/item/abstract.ts"
import fields = foundry.data.fields
import { ItemGURPS2 } from "@module/document/item.ts"
import { EvalEmbeddedRegex, replaceAllStringFunc } from "@util"
import { ItemTemplateType } from "../types.ts"
import { Nameable } from "@module/util/index.ts"
import { StringArrayField } from "../fields/string-array-field.ts"

class BasicInformationTemplate extends ItemDataModel<BasicInformationTemplateSchema> {
	static override defineSchema(): BasicInformationTemplateSchema {
		const fields = foundry.data.fields
		return {
			container: new fields.ForeignDocumentField(ItemGURPS2, { idOnly: true }),
			name: new fields.StringField({
				required: true,
				nullable: false,
				initial: "",
			}),
			notes: new fields.StringField({
				required: true,
				nullable: false,
				initial: "",
				label: "GURPS.Item.BasicInformation.FIELDS.Notes.Name",
			}),
			tags: new StringArrayField({
				required: true,
				nullable: false,
				initial: [],
				label: "GURPS.Item.BasicInformation.FIELDS.Tags.Name",
			}),
			vtt_notes: new fields.StringField({ required: true, nullable: false, initial: "" }),
			reference: new fields.StringField({
				required: true,
				nullable: false,
				initial: "",
				label: "GURPS.Item.BasicInformation.FIELDS.Reference.Name",
			}),
			reference_highlight: new fields.StringField({ required: true, nullable: false, initial: "" }),
		}
	}

	hasTag(tag: string): boolean {
		return this.tags.includes(tag)
	}

	get combinedTags(): string {
		return this.tags.join(", ")
	}

	get processedNotes(): string {
		return replaceAllStringFunc(EvalEmbeddedRegex, this.notesWithReplacements, this.actor)
	}

	/** Replacements */
	get nameWithReplacements(): string {
		if (this.hasTemplate(ItemTemplateType.Replacement))
			return Nameable.apply(this.parent.name, this.nameableReplacements)
		return this.parent.name
	}

	get notesWithReplacements(): string {
		if (this.hasTemplate(ItemTemplateType.Replacement)) return Nameable.apply(this.notes, this.nameableReplacements)
		return this.notes
	}
}

interface BasicInformationTemplate
	extends ItemDataModel<BasicInformationTemplateSchema>,
		ModelPropsFromSchema<BasicInformationTemplateSchema> {}

type BasicInformationTemplateSchema = {
	container: fields.ForeignDocumentField<string>
	name: fields.StringField<string, string, true, false, true>
	notes: fields.StringField<string, string, true, false, true>
	tags: StringArrayField<true, false, true>
	vtt_notes: fields.StringField<string, string, true, false, true>
	reference: fields.StringField<string, string, true, false, true>
	reference_highlight: fields.StringField<string, string, true, false, true>
}

export { BasicInformationTemplate, type BasicInformationTemplateSchema }
