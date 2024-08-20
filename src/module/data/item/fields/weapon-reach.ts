import fields = foundry.data.fields
import { SystemDataModel } from "@module/data/abstract.ts"

class WeaponReach extends foundry.abstract.DataModel<SystemDataModel, WeaponReachSchema> {
	static override defineSchema(): WeaponReachSchema {
		const fields = foundry.data.fields
		return {
			min: new fields.NumberField<number, number, true, false, true>({
				required: true,
				nullable: false,
				initial: 0,
			}),
			max: new fields.NumberField<number, number, true, false, true>({
				required: true,
				nullable: false,
				initial: 0,
			}),
			closeCombat: new fields.BooleanField<boolean>({ required: true, nullable: false, initial: false }),
			changeRequiresReady: new fields.BooleanField<boolean>({ required: true, nullable: false, initial: false }),
		}
	}
}

interface WeaponReach
	extends foundry.abstract.DataModel<SystemDataModel, WeaponReachSchema>,
		ModelPropsFromSchema<WeaponReachSchema> {}

type WeaponReachSchema = {
	min: fields.NumberField<number, number, true, false, true>
	max: fields.NumberField<number, number, true, false, true>
	closeCombat: fields.BooleanField<boolean, boolean, true, false, true>
	changeRequiresReady: fields.BooleanField<boolean, boolean, true, false, true>
}

export { WeaponReach, type WeaponReachSchema }
