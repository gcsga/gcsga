import { BaseFeature } from "./base"
import { AttributeBonusLimitation, FeatureType } from "./data"

export class AttributeBonus extends BaseFeature {
	attribute!: string

	limitation!: AttributeBonusLimitation

	static get defaults(): Record<string, any> {
		return mergeObject(super.defaults, {
			type: FeatureType.AttributeBonus,
			attribute: "st",
			limitation: "none",
		})
	}
}
