import { ItemType, SYSTEM_NAME } from "@module/data/constants.ts"
import { BaseRollGURPS, BaseRollOptions } from "./base-roll.ts"

class ContestRoll extends BaseRollGURPS {
	static override CHAT_TEMPLATE = `systems/${SYSTEM_NAME}/templates/roll/contest-roll.hbs`
	static override TOOLTIP_TEMPLATE = `systems/${SYSTEM_NAME}/templates/roll/contest-roll-tooltip.hbs`

	constructor(formula: string, data: Record<string, unknown>, options: ContestRollOptions) {
		super(formula, data, options)
	}
}

type ContestRollOptions = BaseRollOptions & {
	target?: number
	item?: {
		type: ItemType
		uuid: ItemUUID
		name?: string
		specialization?: string
	}
}

export { ContestRoll, type ContestRollOptions }
