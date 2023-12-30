import { gid } from "@module/data"
import { BonusOwner } from "./bonus_owner"
import { FeatureType, stlimit } from "./data"
import { LeveledAmount, LeveledAmountKeys, LeveledAmountObj } from "./leveled_amount"

export interface AttributeBonusObj extends LeveledAmountObj {
	limitation?: stlimit
	attribute: string
}

export class AttributeBonus extends BonusOwner {
	limitation?: stlimit

	attribute: string

	leveledAmount: LeveledAmount

	constructor(attrID: string = gid.Strength) {
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

	toObject(): AttributeBonusObj {
		return {
			...super.toObject(),
			type: this.type,
			attribute: this.attribute,
		}
	}

	static fromObject(data: AttributeBonusObj): AttributeBonus {
		const bonus = new AttributeBonus(data.attribute)
		const levelData: Partial<Record<keyof LeveledAmountObj, any>> = {}
		for (const key of Object.keys(data)) {
			if (LeveledAmountKeys.includes(key)) {
				levelData[key as keyof LeveledAmountObj] = data[key as keyof AttributeBonusObj]
			} else (bonus as any)[key] = data[key as keyof AttributeBonusObj]
		}
		bonus.leveledAmount = new LeveledAmount(levelData)
		return bonus
	}
}
