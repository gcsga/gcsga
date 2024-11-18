import { ItemDataModel } from "@module/data/item/abstract.ts"
import fields = foundry.data.fields
import { ItemGURPS2 } from "@module/documents/item.ts"
import { EvalEmbeddedRegex, replaceAllStringFunc } from "@util"
import { ItemTemplateType } from "../types.ts"
import { Nameable } from "@module/util/index.ts"
import { StringArrayField } from "../fields/string-array-field.ts"
import { ReplaceableStringField } from "@module/data/fields/replaceable-string-field.ts"
import { ToggleableStringField } from "@module/data/fields/toggleable-string-fields.ts"

class BasicInformationTemplate extends ItemDataModel<BasicInformationTemplateSchema> {
	static override defineSchema(): BasicInformationTemplateSchema {
		const fields = foundry.data.fields
		return {
			container: new fields.ForeignDocumentField(ItemGURPS2, { idOnly: true }),
			name: new ReplaceableStringField({
				required: true,
				nullable: false,
				initial: "",
			}),
			notes: new ReplaceableStringField({
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
			vtt_notes: new ToggleableStringField({ required: true, nullable: false, initial: "" }),
			reference: new ToggleableStringField({
				required: true,
				nullable: false,
				initial: "",
				label: "GURPS.Item.BasicInformation.FIELDS.Reference.Name",
			}),
			reference_highlight: new ToggleableStringField({ required: true, nullable: false, initial: "" }),
		}
	}

	hasTag(tag: string): boolean {
		return this.tags.includes(tag)
	}

	get combinedTags(): string {
		return this.tags.join(", ")
	}

	get processedName(): string {
		return this.nameWithReplacements
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
	name: ReplaceableStringField<string, string, true, false, true>
	notes: ReplaceableStringField<string, string, true, false, true>
	tags: StringArrayField<true, false, true>
	vtt_notes: ToggleableStringField<string, string, true, false, true>
	reference: ToggleableStringField<string, string, true, false, true>
	reference_highlight: ToggleableStringField<string, string, true, false, true>
}

export { BasicInformationTemplate, type BasicInformationTemplateSchema }
