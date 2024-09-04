import { ItemDataModel } from "@module/data/abstract.ts"
import fields = foundry.data.fields
import { RecordField } from "@system"

class ReplacementTemplate extends ItemDataModel<ReplacementTemplateSchema> {
	static override defineSchema(): ReplacementTemplateSchema {
		const fields = foundry.data.fields
		return {
			replacements: new RecordField(
				new fields.StringField({ required: true, nullable: false }),
				new fields.StringField({ required: true, nullable: false }),
			),
		}
	}

	/** The replacmeents to be used with nameables */
	get nameableReplacements(): Map<string, string> {
		return new Map(Object.entries(this.replacements) as [string, string][])
	}
}

interface ReplacementTemplate
	extends ItemDataModel<ReplacementTemplateSchema>,
		ModelPropsFromSchema<ReplacementTemplateSchema> {}

type ReplacementTemplateSchema = {
	replacements: RecordField<
		fields.StringField<string, string, true, false, false>,
		fields.StringField<string, string, true, false, false>
	>
}

export { ReplacementTemplate, type ReplacementTemplateSchema }
