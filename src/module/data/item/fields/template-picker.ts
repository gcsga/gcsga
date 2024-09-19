import { SystemDataModel } from "@module/data/abstract.ts"
import fields = foundry.data.fields
import { LocalizeGURPS, picker } from "@util"
import { NumericCriteria } from "@module/util/numeric-criteria.ts"

class TemplatePicker extends foundry.abstract.DataModel<SystemDataModel, TemplatePickerSchema> {
	static override defineSchema(): TemplatePickerSchema {
		const fields = foundry.data.fields
		return {
			type: new fields.StringField({
				required: true,
				nullable: false,
				choices: picker.Types,
				initial: picker.Type.NotApplicable,
			}),
			qualifier: new fields.EmbeddedDataField(NumericCriteria),
		}
	}

	get description(): string {
		switch (this.type) {
			case picker.Type.Count:
				return LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.TemplatePicker.descriptionCount, {
					number: this.qualifier.altString(),
				})
			case picker.Type.Points: {
				const points =
					this.qualifier.qualifier === 1
						? LocalizeGURPS.translations.GURPS.TemplatePicker.points
						: LocalizeGURPS.translations.GURPS.TemplatePicker.point
				return LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.TemplatePicker.descriptionCount, {
					number: this.qualifier.altString(),
					points,
				})
			}
			default:
				return ""
		}
	}
}

interface TemplatePicker
	extends foundry.abstract.DataModel<SystemDataModel, TemplatePickerSchema>,
		Omit<ModelPropsFromSchema<TemplatePickerSchema>, "qualifier"> {
	qualifier: NumericCriteria
}

type TemplatePickerSchema = {
	type: fields.StringField<picker.Type, picker.Type, true, false, true>
	qualifier: fields.EmbeddedDataField<NumericCriteria, true, false, true>
}

export { TemplatePicker, type TemplatePickerSchema }
