import { SystemDataModel } from "@module/data/abstract.ts"
import fields = foundry.data.fields
import { picker } from "@util"
import { NumericCriteria } from "@module/data/item/components/numeric-criteria.ts"
import { NumericCriteriaField } from "./numeric-criteria-field.ts"

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
			qualifier: new NumericCriteriaField({ required: true, nullable: false }),
		}
	}

	get description(): string {
		switch (this.type) {
			case picker.Type.Count:
				return game.i18n.format("GURPS.TemplatePicker.descriptionCount", {
					number: this.qualifier.altString(),
				})
			case picker.Type.Points: {
				const points =
					this.qualifier.qualifier === 1
						? game.i18n.localize("GURPS.TemplatePicker.points")
						: game.i18n.localize("GURPS.TemplatePicker.point")
				return game.i18n.format("GURPS.TemplatePicker.descriptionCount", {
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
	qualifier: NumericCriteriaField<true, false, true>
}

export { TemplatePicker, type TemplatePickerSchema }
