import { NumericCriteria, NumericCriteriaObj, NumericCriteriaSchema, picker } from "@util"

export interface TemplatePickerObj {
	type: picker.Type
	qualifier: NumericCriteriaObj
}

type TemplatePickerSchema = {
	type: foundry.data.fields.StringField<picker.Type, picker.Type, true, false, true>
	qualifier: foundry.data.fields.SchemaField<NumericCriteriaSchema>
}

export class TemplatePicker {
	static defineSchema(): TemplatePickerSchema {
		return {
			type: new foundry.data.fields.StringField<picker.Type, picker.Type, true>({ choices: picker.Types }),
			qualifier: new foundry.data.fields.SchemaField({ ...NumericCriteria.defineSchema() }),
		}
	}
}
