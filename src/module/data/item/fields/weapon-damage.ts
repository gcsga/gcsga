import { AbstractWeaponTemplate } from "../templates/index.ts"
import { WeaponField } from "./weapon-field.ts"
import fields = foundry.data.fields
import { stdmg } from "@util"
import { DiceGURPS, DiceSchema } from "@system"

class WeaponDamage extends WeaponField<AbstractWeaponTemplate, WeaponDamageSchema> {
	static override defineSchema(): WeaponDamageSchema {
		const fields = foundry.data.fields
		return {
			type: new fields.StringField({ required: true, nullable: false, initial: "" }),
			st: new fields.StringField({
				required: true,
				nullable: false,
				choices: stdmg.Options,
				initial: stdmg.Option.Thrust,
			}),
			leveled: new fields.BooleanField({ required: true, nullable: false, initial: false }),
			st_mul: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			base: new fields.SchemaField(DiceGURPS.defineSchema()),
			armor_divisor: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			fragmentation: new fields.SchemaField(DiceGURPS.defineSchema()),
			fragmentation_armor_divisor: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			fragmentation_type: new fields.StringField({ required: true, nullable: false, initial: "" }),
			modifier_per_die: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
		}
	}

	override toString(): string {
		return ""
	}

	override clean(): void {}
}

interface WeaponDamage
	extends WeaponField<AbstractWeaponTemplate, WeaponDamageSchema>,
		Omit<ModelPropsFromSchema<WeaponDamageSchema>, "base" | "fragmentation"> {
	base: DiceGURPS
	fragmentation: DiceGURPS
}

type WeaponDamageSchema = {
	type: fields.StringField<string, string, true, false, true>
	st: fields.StringField<stdmg.Option, stdmg.Option, true, false, true>
	leveled: fields.BooleanField<boolean, boolean, true, false, true>
	st_mul: fields.NumberField<number, number, true, false, true>
	base: fields.SchemaField<DiceSchema>
	armor_divisor: fields.NumberField<number, number, true, false, true>
	fragmentation: fields.SchemaField<DiceSchema>
	fragmentation_armor_divisor: fields.NumberField<number, number, true, false, true>
	fragmentation_type: fields.StringField<string, string, true, false, true>
	modifier_per_die: fields.NumberField<number, number, true, false, true>
}

export { WeaponDamage, type WeaponDamageSchema }
