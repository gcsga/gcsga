import { feature } from "@util/enum/feature.ts"
import { BaseFeature } from "./bonus-owner.ts"
import { LeveledAmount } from "./leveled-amount.ts"
import { MoveBonusSchema, MoveBonusType } from "./data.ts"
import { gid } from "@data"

export class MoveBonus extends BaseFeature<feature.Type.MoveBonus> {
	move_type: string

	limitation: MoveBonusType

	override leveledAmount: LeveledAmount

	constructor() {
		super(feature.Type.MoveBonus)
		this.move_type = gid.Ground
		this.limitation = MoveBonusType.Base
		this.leveledAmount = new LeveledAmount({ amount: 1 })
	}

	override toObject(): SourceFromSchema<MoveBonusSchema> {
		return {
			...super.toObject(),
			move_type: this.move_type,
			limitation: this.limitation,
		}
	}

	static fromObject(data: SourceFromSchema<MoveBonusSchema>): MoveBonus {
		const bonus = new MoveBonus()
		bonus.move_type = data.move_type
		bonus.limitation = data.limitation
		bonus.leveledAmount = LeveledAmount.fromObject(data)
		return bonus
	}
}
