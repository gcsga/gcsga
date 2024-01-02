import { gid } from "@module/data"
import { BonusOwner } from "./bonus_owner"
import { feature } from "@util/enum"

export interface CostReductionObj {
	attribute: string
	percentage?: number
}

export class CostReduction extends BonusOwner {
	type = feature.Type.CostReduction

	attribute: string

	percentage?: number

	constructor(attrID: string = gid.Strength) {
		super()
		this.attribute = attrID
		this.percentage = 40
	}

	// @ts-expect-error incorrect return type
	toObject(): CostReductionObj {
		return {
			attribute: this.attribute,
			percentage: this.percentage,
		}
	}

	static fromObject(data: CostReductionObj): CostReduction {
		const bonus = new CostReduction(data.attribute)
		for (const key of Object.keys(data)) {
			; (bonus as any)[key as keyof CostReductionObj] = data[key as keyof CostReductionObj]
		}
		return bonus
	}
}
