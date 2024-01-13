import { gid } from "@module/data"
import { BonusOwner } from "./bonus_owner"
import { MoveBonusType } from "./data"
import { LeveledAmount, LeveledAmountObj } from "./leveled_amount"
import { feature } from "@util/enum"

export interface MoveBonusObj extends LeveledAmountObj {
	move_type: string
	limitation: MoveBonusType
}

export class MoveBonus extends BonusOwner {
	type = feature.Type.MoveBonus

	move_type: string

	limitation: MoveBonusType

	leveledAmount: LeveledAmount

	constructor() {
		super()
		this.move_type = gid.Ground
		this.limitation = MoveBonusType.Base
		this.leveledAmount = new LeveledAmount({ amount: 1 })
	}

	toObject(): MoveBonusObj {
		return {
			...super.toObject(),
			type: this.type,
			move_type: this.move_type,
			limitation: this.limitation,
		}
	}

	static fromObject(data: MoveBonusObj): MoveBonus {
		const bonus = new MoveBonus()
		bonus.move_type = data.move_type
		bonus.limitation = data.limitation
		bonus.leveledAmount = LeveledAmount.fromObject(data)
		return bonus
	}
}
