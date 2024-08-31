import { ItemDataModel } from "../abstract.ts"
import fields = foundry.data.fields
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { AbstractWeaponTemplate, AbstractWeaponTemplateSchema } from "./templates/abstract-weapon.ts"
import { Nameable } from "@module/util/nameable.ts"

class WeaponRangedData extends ItemDataModel.mixin(BasicInformationTemplate, AbstractWeaponTemplate) {
	static override defineSchema(): WeaponRangedSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			accuracy: new fields.StringField(),
			range: new fields.StringField(),
			rate_of_fire: new fields.StringField(),
			shots: new fields.StringField(),
			bulk: new fields.StringField(),
			recoil: new fields.StringField(),
		}) as WeaponRangedSchema
	}

	fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void {
		Nameable.extract(this.name, m, existing)
		Nameable.extract(this.notes, m, existing)
	}
}

interface WeaponRangedData extends ModelPropsFromSchema<WeaponRangedSchema> {}

type WeaponRangedSchema = BasicInformationTemplateSchema &
	AbstractWeaponTemplateSchema & {
		accuracy: fields.StringField<string, string, true, false, true>
		range: fields.StringField<string, string, true, false, true>
		rate_of_fire: fields.StringField<string, string, true, false, true>
		shots: fields.StringField<string, string, true, false, true>
		bulk: fields.StringField<string, string, true, false, true>
		recoil: fields.StringField<string, string, true, false, true>
	}

export { WeaponRangedData, type WeaponRangedSchema }
