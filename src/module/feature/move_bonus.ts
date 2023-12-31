import { gid } from "@module/data"
import { BonusOwner } from "./bonus_owner"
import { MoveBonusType } from "./data"
import { LeveledAmount, LeveledAmountKeys, LeveledAmountObj } from "./leveled_amount"

export interface MoveBonusObj extends LeveledAmountObj {
	move_type: string
	limitation: MoveBonusType
}

export class MoveBonus extends BonusOwner {
	move_type: string

	limitation: MoveBonusType

	leveledAmount: LeveledAmount

	constructor() {
		super()
		this.move_type = gid.Ground
		this.limitation = MoveBonusType.Base
		this.leveledAmount = new LeveledAmount({ amount: 1 })
	}

	static fromObject(data: MoveBonusObj): MoveBonus {
		const bonus = new MoveBonus()
		const levelData: Partial<Record<keyof LeveledAmountObj, any>> = {}
		for (const key of Object.keys(data)) {
			if (LeveledAmountKeys.includes(key)) {
				levelData[key as keyof LeveledAmountObj] = data[key as keyof MoveBonusObj]
			} else (bonus as any)[key] = data[key as keyof MoveBonusObj]
		}
		bonus.leveledAmount = new LeveledAmount(levelData)
		return bonus
	}
}
