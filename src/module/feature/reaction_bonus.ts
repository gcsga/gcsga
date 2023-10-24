import { BaseFeature } from "./base"
import { FeatureType } from "./data"

export class ReactionBonus extends BaseFeature {
	sources: string[] = []

	situation!: string

	static get defaults(): Record<string, any> {
		return mergeObject(super.defaults, {
			type: FeatureType.ReactionBonus,
			situation: "from others",
		})
	}
}
