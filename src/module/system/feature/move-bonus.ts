import { MoveBonusSchema, MoveBonusType } from "./data.ts"
import { gid } from "@data"
import { BaseFeature } from "./base.ts"
import { feature } from "@util"

class MoveBonus extends BaseFeature<MoveBonusSchema> {
	static override TYPE = feature.Type.MoveBonus

	static override defineSchema(): MoveBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			move_type: new fields.StringField({ initial: gid.Ground }),
			limitation: new fields.StringField({ choices: Object.values(MoveBonusType), initial: MoveBonusType.Base }),
		}
	}

	fillWithNameableKeys(_m: Map<string, string>, _existing: Map<string, string>): void {}
}

interface MoveBonus extends BaseFeature<MoveBonusSchema>, ModelPropsFromSchema<MoveBonusSchema> {}

export { MoveBonus }
