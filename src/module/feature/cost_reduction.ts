import { BonusOwner } from "./bonus_owner"
import { FeatureType } from "./data"

export interface CostReductionObj {
	attribute?: string
	percentage?: number
}

export class CostReduction extends BonusOwner {
	type = FeatureType.CostReduction

	attribute?: string

	percentage?: number

	constructor(attrID: string) {
		super()
		this.attribute = attrID
		this.percentage = 40
	}
}
