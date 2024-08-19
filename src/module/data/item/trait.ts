import { ItemDataModel } from "../abstract.ts"
import fields = foundry.data.fields
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { selfctrl } from "@util"

// @ts-expect-error deep type instantiation
class TraitData extends ItemDataModel.mixin(BasicInformationTemplate) {
	static override defineSchema(): TraitSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			userdesc: new fields.StringField<string, string>(),
			base_points: new fields.NumberField<number, number, true, false>({
				required: true,
				nullable: false,
				integer: true,
				initial: 0,
			}),
			levels: new fields.NumberField<number>({ min: 0, nullable: true }),
			points_per_level: new fields.NumberField<number>({ integer: true, nullable: true }),
			cr: new fields.NumberField<selfctrl.Roll, selfctrl.Roll, true, false, true>({
				choices: selfctrl.Rolls,
				initial: selfctrl.Roll.NoCR,
				nullable: false,
			}),
			cr_adj: new fields.StringField<selfctrl.Adjustment>({
				choices: selfctrl.Adjustments,
				initial: selfctrl.Adjustment.NoCRAdj,
			}),
			disabled: new fields.BooleanField<boolean>({ initial: false }),
			round_down: new fields.BooleanField<boolean>({ initial: false }),
			can_level: new fields.BooleanField<boolean>({ initial: false }),
		})
	}
}

type TraitSchema = BasicInformationTemplateSchema & {
	userdesc: fields.StringField<string, string>
	base_points: fields.NumberField<number, number, true, false, true>
	levels: fields.NumberField
	points_per_level: fields.NumberField
	cr: fields.NumberField<selfctrl.Roll, selfctrl.Roll, true, false, true>
	cr_adj: fields.StringField<selfctrl.Adjustment>
	disabled: fields.BooleanField<boolean>
	round_down: fields.BooleanField<boolean>
	can_level: fields.BooleanField
}

export { TraitData, type TraitSchema }
