import { gid } from "@module/data/constants.ts"
import fields = foundry.data.fields

export type SkillDefaultType = gid.Block | gid.Parry | gid.Skill | gid.Ten | string

export type SkillDefaultSchema = {
	type: fields.StringField<SkillDefaultType, SkillDefaultType, true, false, true>
	name: fields.StringField<string, string, true, true, true>
	specialization: fields.StringField<string, string, true, true, true>
	modifier: fields.NumberField<number, number, true, false, true>
	level: fields.NumberField<number, number, true, false, true>
	adjusted_level: fields.NumberField<number, number, true, false, true>
	points: fields.NumberField<number, number, true, false, true>
}
