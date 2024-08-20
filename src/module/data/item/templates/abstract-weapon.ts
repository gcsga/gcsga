import { ItemDataModel, ItemDataSchema } from "@module/data/abstract.ts"
import fields = foundry.data.fields
import { WeaponDamage, WeaponDamageSchema } from "@item/abstract-weapon/weapon-damage.ts"
import { SkillDefault, SkillDefaultSchema } from "@system"
import { stdmg } from "@util"

class AbstractWeaponTemplate extends ItemDataModel<AbstractWeaponTemplateSchema> {
	static override defineSchema(): AbstractWeaponTemplateSchema {
		const fields = foundry.data.fields
		return {
			...super.defineSchema(),
			strength: new fields.StringField({
				required: true,
				nullable: false,
				choices: stdmg.Options,
				initial: stdmg.Option.Thrust,
			}),
			defaults: new fields.ArrayField(new fields.SchemaField(SkillDefault.defineSchema())),
			damage: new fields.SchemaField(WeaponDamage.defineSchema()),
			unready: new fields.BooleanField({ required: true, nullable: false, initial: false }),
		}
	}
}

interface AbstractWeaponTemplate
	extends ItemDataModel<AbstractWeaponTemplateSchema>,
		ModelPropsFromSchema<AbstractWeaponTemplateSchema> {
	constructor: typeof AbstractWeaponTemplate
}

type AbstractWeaponTemplateSchema = ItemDataSchema & {
	strength: fields.StringField<string, string, true, false, true>
	defaults: fields.ArrayField<fields.SchemaField<SkillDefaultSchema>>
	damage: fields.SchemaField<WeaponDamageSchema>
	unready: fields.BooleanField<boolean, boolean>
}

export { AbstractWeaponTemplate, type AbstractWeaponTemplateSchema }
