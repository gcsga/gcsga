import fields = foundry.data.fields
import { gid } from "@data"
import { BaseFeature, BaseFeatureSchema } from "./base-feature.ts"
import { feature } from "@util"

enum MoveBonusType {
	Base = "base",
	Enhanced = "enhanced",
}

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

type MoveBonusSchema = BaseFeatureSchema & {
	move_type: fields.StringField<string, string, true, false, true>
	limitation: fields.StringField<MoveBonusType, MoveBonusType, true, false, true>
}

export { MoveBonus, MoveBonusType, type MoveBonusSchema }
