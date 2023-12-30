import { gid } from "@module/data"
import { BonusOwner } from "./bonus_owner"
import { FeatureType, stlimit } from "./data"
import { LeveledAmount, LeveledAmountObj } from "./leveled_amount"

export interface AttributeBonusObj extends LeveledAmountObj {
	limitation?: stlimit
	attribute: string
}

export class AttributeBonus extends BonusOwner {
	limitation?: stlimit

	attribute: string

	leveledAmount: LeveledAmount

	constructor(attrID: string) {
		super()
		this.type = FeatureType.AttributeBonus
		this.attribute = attrID
		this.limitation = stlimit.None
		this.leveledAmount = new LeveledAmount({ amount: 1 })
	}

	get actualLimitation(): stlimit {
		if (this.attribute === gid.Strength) return this.limitation ?? stlimit.None
		return stlimit.None
	}
}
