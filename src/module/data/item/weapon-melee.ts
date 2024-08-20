import { ItemDataModel } from "../abstract.ts"
import fields = foundry.data.fields
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { AbstractWeaponTemplate, AbstractWeaponTemplateSchema } from "./templates/abstract-weapon.ts"

class WeaponMeleeData extends ItemDataModel.mixin(BasicInformationTemplate, AbstractWeaponTemplate) {
	static override defineSchema(): WeaponMeleeSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			reach: new fields.StringField(),
			parry: new fields.StringField(),
			block: new fields.StringField(),
		}) as WeaponMeleeSchema
	}
}

interface WeaponMeleeData extends ModelPropsFromSchema<WeaponMeleeSchema> {}

type WeaponMeleeSchema = BasicInformationTemplateSchema &
	AbstractWeaponTemplateSchema & {
		reach: fields.StringField<string, string, true, false, true>
		parry: fields.StringField<string, string, true, false, true>
		block: fields.StringField<string, string, true, false, true>
	}

export { WeaponMeleeData, type WeaponMeleeSchema }
