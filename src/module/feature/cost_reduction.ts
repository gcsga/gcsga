import { BaseFeature } from "./base"
import { FeatureType } from "./data"

export class CostReduction extends BaseFeature {
	attribute!: string

	percentage!: number

	static get defaults(): Record<string, any> {
		return mergeObject(super.defaults, {
			type: FeatureType.CostReduction,
			attribute: "st",
			percentage: 40,
		})
	}
}
