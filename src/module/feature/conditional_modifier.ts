import { BaseFeature } from "./base"
import { FeatureType } from "./data"

export class ConditionalModifier extends BaseFeature {
	situation!: string

	static get defaults(): Record<string, any> {
		return mergeObject(super.defaults, {
			type: FeatureType.ConditionalModifier,
			situation: "triggering condition",
		})
	}

	get adjustedAmount(): number {
		return this.amount * (this.per_level ? this.levels || 0 : 1)
	}
}
