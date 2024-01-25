import { feature } from "@util/enum/feature.ts"
import { BonusOwner } from "./bonus_owner.ts"
import { gid } from "@module/data/misc.ts"
import { CostReductionObj } from "./data.ts"

export class CostReduction extends BonusOwner {
	override type = feature.Type.CostReduction

	attribute: string

	percentage?: number

	constructor(attrID: string = gid.Strength) {
		super()
		this.attribute = attrID
		this.percentage = 40
	}

	// @ts-expect-error incorrect return type
	override toObject(): CostReductionObj {
		return {
			type: this.type,
			attribute: this.attribute,
			percentage: this.percentage,
		}
	}

	static fromObject(data: CostReductionObj): CostReduction {
		const bonus = new CostReduction(data.attribute)
		bonus.attribute = data.attribute
		bonus.percentage = data.percentage
		return bonus
	}
}
