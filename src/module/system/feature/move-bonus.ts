import { MoveBonusSchema, MoveBonusType } from "./data.ts"
import { gid } from "@data"
import { BaseFeature, LeveledAmount } from "./base.ts"

class MoveBonus extends BaseFeature<MoveBonusSchema> {

	static override defineSchema(): MoveBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			...LeveledAmount.defineSchema(),
			move_type: new fields.StringField({ initial: gid.Ground }),
			limitation: new fields.StringField({ choices: Object.values(MoveBonusType), initial: MoveBonusType.Base }),
		}
	}

}

interface MoveBonus extends BaseFeature<MoveBonusSchema>, ModelPropsFromSchema<MoveBonusSchema> { }

export { MoveBonus }
