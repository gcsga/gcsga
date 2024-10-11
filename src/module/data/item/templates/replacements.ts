import { ItemDataModel } from "@module/data/item/abstract.ts"
import fields = foundry.data.fields
import { RecordField } from "@system"
import { Nameable } from "@module/util/nameable.ts"

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

	override prepareBaseData() {
		const replacements = new Map<string, string>()
		this.fillWithNameableKeys(replacements, this.nameableReplacements)
		this.replacements = Object.fromEntries(replacements.entries())
	}

	fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string> = this.nameableReplacements): void {
		Nameable.extract(this.parent.name, m, existing)
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
