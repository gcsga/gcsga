// import fields = foundry.data.fields
// import {
// 	AbstractWeaponSource,
// 	AbstractWeaponSystemData,
// 	AbstractWeaponSystemSchema,
// } from "@item/abstract-weapon/data.ts"
// import { ItemType } from "@module/data/constants.ts"
// import { MeleeWeaponGURPS } from "./document.ts"
//
// class MeleeWeaponSystemData extends AbstractWeaponSystemData<MeleeWeaponGURPS, MeleeWeaponSystemSchema> {
// 	static override defineSchema(): MeleeWeaponSystemSchema {
// 		const fields = foundry.data.fields
//
// 		return {
// 			...super.defineSchema(),
// 			type: new fields.StringField({ required: true, initial: ItemType.WeaponMelee }),
// 			usage: new fields.StringField({
// 				required: true,
// 			}),
// 			reach: new fields.StringField(),
// 			parry: new fields.StringField(),
// 			block: new fields.StringField(),
// 		}
// 	}
// }
//
// interface MeleeWeaponSystemData
// 	extends AbstractWeaponSystemData<MeleeWeaponGURPS, MeleeWeaponSystemSchema>,
// 		ModelPropsFromSchema<MeleeWeaponSystemSchema> {}
//
// type MeleeWeaponSystemSchema = AbstractWeaponSystemSchema & {
// 	type: fields.StringField<ItemType.WeaponMelee, ItemType.WeaponMelee, true, false, true>
// 	reach: fields.StringField<string, string, true, false, true>
// 	parry: fields.StringField<string, string, true, false, true>
// 	block: fields.StringField<string, string, true, false, true>
// }
//
// type MeleeWeaponSystemSource = SourceFromSchema<MeleeWeaponSystemSchema>
//
// type MeleeWeaponSource = AbstractWeaponSource<ItemType.WeaponMelee, MeleeWeaponSystemSource>
//
// export type { MeleeWeaponSource, MeleeWeaponSystemSource }
// export { MeleeWeaponSystemData }
