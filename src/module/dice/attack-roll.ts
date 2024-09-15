import { SuccessRoll, SuccessRollOptions } from "./success-roll.ts"

class AttackRoll extends SuccessRoll {
	constructor(formula: string, data: Record<string, unknown>, options: SuccessRollOptions) {
		super(formula, data, options)
	}
}

export { AttackRoll }
