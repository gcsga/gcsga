import { gid } from "@module/data"
import { BaseFeature } from "./base"
import { FeatureType, MoveBonusType } from "./data"

export class MoveBonus extends BaseFeature {
	move_type!: string

	limitation!: MoveBonusType

	static get defaults(): Record<string, any> {
		return mergeObject(super.defaults, {
			type: FeatureType.MoveBonus,
			attribute: gid.Ground,
			limitation: MoveBonusType.Base,
		})
	}
}

