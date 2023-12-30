import { gid } from "@module/data"
import { BonusOwner } from "./bonus_owner"
import { MoveBonusType } from "./data"
import { LeveledAmount, LeveledAmountObj } from "./leveled_amount"

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
}
