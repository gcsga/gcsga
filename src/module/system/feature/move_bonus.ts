import { feature } from "@util/enum/feature.ts"
import { BonusOwner } from "./bonus_owner.ts"
import { LeveledAmount } from "./leveled_amount.ts"
import { gid } from "@module/data/misc.ts"
import { MoveBonusObj, MoveBonusType } from "./data.ts"

export class MoveBonus extends BonusOwner {
	override type = feature.Type.MoveBonus

	move_type: string

	limitation: MoveBonusType

	override leveledAmount: LeveledAmount

	constructor() {
		super()
		this.move_type = gid.Ground
		this.limitation = MoveBonusType.Base
		this.leveledAmount = new LeveledAmount({ amount: 1 })
	}

	override toObject(): MoveBonusObj {
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
