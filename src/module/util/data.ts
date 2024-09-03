import type { NumericCompareType, StringCompareType } from "@module/data/constants.ts"
import fields = foundry.data.fields

type StringCriteriaSchema = {
	compare: fields.StringField<StringCompareType, StringCompareType, true, false, true>
	qualifier: fields.StringField<string, string, true, false, true>
}

type NumericCriteriaSchema = {
	compare: fields.StringField<NumericCompareType, NumericCompareType, true, false, true>
	qualifier: fields.NumberField<number, number, true, true, true>
}

type WeightCriteriaSchema = {
	compare: fields.StringField<NumericCompareType, NumericCompareType, true, false, true>
	qualifier: fields.StringField<string, string, true, false, true>
}

export type { NumericCriteriaSchema, StringCriteriaSchema, WeightCriteriaSchema }
