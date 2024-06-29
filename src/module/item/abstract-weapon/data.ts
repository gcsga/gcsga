import fields = foundry.data.fields
import { BaseItemSourceGURPS, ItemFlagsGURPS, ItemSystemSource } from "@item/base/data.ts"
import { ItemSystemModel, ItemSystemSchema } from "@item/base/schema.ts"
import { ItemFlags, SYSTEM_NAME, WeaponType } from "@module/data/constants.ts"
import { SkillDefault, SkillDefaultSchema } from "@system"
import { AbstractWeaponGURPS } from "./document.ts"
import { WeaponDamage, WeaponDamageSchema } from "./weapon-damage.ts"

type WeaponFlags = ItemFlagsGURPS & {
	[SYSTEM_NAME]: {
		[ItemFlags.Unready]: boolean
	}
}
abstract class AbstractWeaponSystemData<
	TParent extends AbstractWeaponGURPS,
	TSchema extends AbstractWeaponSystemSchema,
> extends ItemSystemModel<TParent, TSchema> {

	static override defineSchema(): AbstractWeaponSystemSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			strength: new fields.StringField(),
			usage: new fields.StringField({
				required: true,
				// TODO: localize
				initial: "Usage"
			}),
			usage_notes: new fields.StringField(),
			defaults: new fields.ArrayField(new fields.SchemaField(SkillDefault.defineSchema())),
			damage: new fields.SchemaField(WeaponDamage.defineSchema()),
		}
	}
}

interface AbstractWeaponSystemData<
	TParent extends AbstractWeaponGURPS,
	TSchema extends AbstractWeaponSystemSchema,
> extends ItemSystemModel<TParent, TSchema> { }

type AbstractWeaponSystemSchema = ItemSystemSchema & {
	strength: fields.StringField<string, string, true, false, true>
	usage: fields.StringField<string, string, true, false, true>
	usage_notes: fields.StringField
	defaults: fields.ArrayField<fields.SchemaField<SkillDefaultSchema>>
	damage: fields.SchemaField<WeaponDamageSchema>
}

type AbstractWeaponSource<
	TType extends WeaponType,
	TSystemSource extends AbstractWeaponSystemSource = AbstractWeaponSystemSource,
> = BaseItemSourceGURPS<TType, TSystemSource>

interface AbstractWeaponSystemSource extends ItemSystemSource { }

export { AbstractWeaponSystemData }
export type { AbstractWeaponSource, AbstractWeaponSystemSchema, WeaponFlags }
