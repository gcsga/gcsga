// import { NumericCriteriaSchema } from "@module/util/data.ts"
// import { NumericCriteria } from "@module/util/numeric-criteria.ts"
// import { picker } from "@util"
//
// export type TemplatePickerSchema = {
// 	type: foundry.data.fields.StringField<picker.Type, picker.Type, true, false, true>
// 	qualifier: foundry.data.fields.EmbeddedDataField<NumericCriteria,true,false,true>
// }
//
// export class TemplatePicker {
// 	static defineSchema(): TemplatePickerSchema {
// 		return {
// 			type: new foundry.data.fields.StringField<picker.Type, picker.Type, true>({ choices: picker.Types }),
// 			qualifier: new foundry.data.fields.SchemaField({ ...NumericCriteria.defineSchema() }),
// 		}
// 	}
// }
