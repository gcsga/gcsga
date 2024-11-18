import fields = foundry.data.fields
import { BaseAttack, BaseAttackSchema } from "./base-attack.ts"
import { WeaponAccuracy } from "./fields/weapon-accuracy.ts"
import { WeaponBulk } from "./fields/weapon-bulk.ts"
import { WeaponRange } from "./fields/weapon-range.ts"
import { WeaponRecoil } from "./fields/weapon-recoil.ts"
import { WeaponROF } from "./fields/weapon-rof.ts"
import { WeaponShots } from "./fields/weapon-shots.ts"

class AttackRanged extends BaseAttack<AttackRangedSchema> {
	static override defineSchema(): AttackRangedSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			accuracy: new fields.EmbeddedDataField(WeaponAccuracy),
			range: new fields.EmbeddedDataField(WeaponRange),
			rate_of_fire: new fields.EmbeddedDataField(WeaponROF),
			shots: new fields.EmbeddedDataField(WeaponShots),
			bulk: new fields.EmbeddedDataField(WeaponBulk),
			recoil: new fields.EmbeddedDataField(WeaponRecoil),
		}
	}
}

interface AttackRanged extends ModelPropsFromSchema<AttackRangedSchema> {}

type AttackRangedSchema = BaseAttackSchema & {
	accuracy: fields.EmbeddedDataField<WeaponAccuracy>
	range: fields.EmbeddedDataField<WeaponRange>
	rate_of_fire: fields.EmbeddedDataField<WeaponROF>
	shots: fields.EmbeddedDataField<WeaponShots>
	bulk: fields.EmbeddedDataField<WeaponBulk>
	recoil: fields.EmbeddedDataField<WeaponRecoil>
}

export { AttackRanged, type AttackRangedSchema }
