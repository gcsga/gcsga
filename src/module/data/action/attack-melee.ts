import fields = foundry.data.fields
import { WeaponBlock } from "./fields/weapon-block.ts"
import { WeaponParry } from "./fields/weapon-parry.ts"
import { WeaponReach } from "./fields/weapon-reach.ts"
import { BaseAttack, BaseAttackSchema } from "./base-attack.ts"

class AttackMelee extends BaseAttack<AttackMeleeSchema> {
	static override defineSchema(): AttackMeleeSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			reach: new fields.EmbeddedDataField(WeaponReach),
			parry: new fields.EmbeddedDataField(WeaponParry),
			block: new fields.EmbeddedDataField(WeaponBlock),
		}
	}
}

type AttackMeleeSchema = BaseAttackSchema & {
	reach: fields.EmbeddedDataField<WeaponReach>
	parry: fields.EmbeddedDataField<WeaponParry>
	block: fields.EmbeddedDataField<WeaponBlock>
}

export { AttackMelee, type AttackMeleeSchema }
