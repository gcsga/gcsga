import fields = foundry.data.fields
import {
	AbstractWeaponSource,
	AbstractWeaponSystemData,
	AbstractWeaponSystemSchema,
} from "@item/abstract-weapon/data.ts"
import { ItemType } from "@module/data/constants.ts"
import { MeleeWeaponGURPS } from "./document.ts"
import { LocalizeGURPS } from "@util"

class MeleeWeaponSystemData extends AbstractWeaponSystemData<MeleeWeaponGURPS, MeleeWeaponSystemSchema> {
	static override defineSchema(): MeleeWeaponSystemSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, initial: ItemType.MeleeWeapon }),
			usage: new fields.StringField({
				required: true,
				initial: LocalizeGURPS.translations.TYPES.Item[ItemType.MeleeWeapon],
			}),
			reach: new fields.StringField(),
			parry: new fields.StringField(),
			block: new fields.StringField(),
		}
	}
}

interface MeleeWeaponSystemData
	extends AbstractWeaponSystemData<MeleeWeaponGURPS, MeleeWeaponSystemSchema>,
	ModelPropsFromSchema<MeleeWeaponSystemSchema> { }

type MeleeWeaponSystemSchema = AbstractWeaponSystemSchema & {
	type: fields.StringField<ItemType.MeleeWeapon, ItemType.MeleeWeapon, true, false, true>
	reach: fields.StringField<string, string, true, false, true>
	parry: fields.StringField<string, string, true, false, true>
	block: fields.StringField<string, string, true, false, true>
}

type MeleeWeaponSystemSource = SourceFromSchema<MeleeWeaponSystemSchema>

type MeleeWeaponSource = AbstractWeaponSource<ItemType.MeleeWeapon, MeleeWeaponSystemSource>

export type { MeleeWeaponSource, MeleeWeaponSystemSource }
export { MeleeWeaponSystemData }
