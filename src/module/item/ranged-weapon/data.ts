// import fields = foundry.data.fields
// import {
// 	AbstractWeaponSource,
// 	AbstractWeaponSystemData,
// 	AbstractWeaponSystemSchema,
// } from "@item/abstract-weapon/data.ts"
// import { ItemType } from "@module/data/constants.ts"
// import { RangedWeaponGURPS } from "./document.ts"
//
// class RangedWeaponSystemData extends AbstractWeaponSystemData<RangedWeaponGURPS, RangedWeaponSystemSchema> {
// 	static override defineSchema(): RangedWeaponSystemSchema {
// 		const fields = foundry.data.fields
//
// 		return {
// 			...super.defineSchema(),
// 			type: new fields.StringField({ required: true, initial: ItemType.WeaponRanged }),
// 			usage: new fields.StringField({
// 				required: true,
// 			}),
// 			accuracy: new fields.StringField(),
// 			range: new fields.StringField(),
// 			rate_of_fire: new fields.StringField(),
// 			shots: new fields.StringField(),
// 			bulk: new fields.StringField(),
// 			recoil: new fields.StringField(),
// 		}
// 	}
// }
//
// interface RangedWeaponSystemData
// 	extends AbstractWeaponSystemData<RangedWeaponGURPS, RangedWeaponSystemSchema>,
// 		ModelPropsFromSchema<RangedWeaponSystemSchema> {}
//
// type RangedWeaponSystemSchema = AbstractWeaponSystemSchema & {
// 	type: fields.StringField<ItemType.WeaponRanged, ItemType.WeaponRanged, true, false, true>
// 	accuracy: fields.StringField<string, string, true, false, true>
// 	range: fields.StringField<string, string, true, false, true>
// 	rate_of_fire: fields.StringField<string, string, true, false, true>
// 	shots: fields.StringField<string, string, true, false, true>
// 	bulk: fields.StringField<string, string, true, false, true>
// 	recoil: fields.StringField<string, string, true, false, true>
// }
//
// type RangedWeaponSystemSource = SourceFromSchema<RangedWeaponSystemSchema>
//
// type RangedWeaponSource = AbstractWeaponSource<ItemType.WeaponRanged, RangedWeaponSystemSource>
//
// export type { RangedWeaponSource, RangedWeaponSystemSource }
// export { RangedWeaponSystemData }
