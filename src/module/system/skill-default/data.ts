import fields = foundry.data.fields
import { SkillDefaultType } from "@module/data/index.ts"

export type SkillDefaultSchema = {
	type: fields.StringField<SkillDefaultType, SkillDefaultType, true, false, true>
	name: fields.StringField<string, string, true, true, true>
	specialization: fields.StringField<string, string, true, true, true>
	modifier: fields.NumberField<number, number, true, false, true>
	level: fields.NumberField<number, number, true, false, true>
	adjusted_level: fields.NumberField<number, number, true, false, true>
	points: fields.NumberField<number, number, true, false, true>
}
