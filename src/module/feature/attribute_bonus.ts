import { BaseFeature } from "./base"
import { FeatureType } from "./data"

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

export enum AttributeBonusLimitation {
	None = "none",
	Striking = "striking_only",
	Lifting = "lifting_only",
	Throwing = "throwing_only",
}
