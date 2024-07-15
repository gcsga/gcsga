import { SheetSettings } from "@system"
import type { CharacterGURPS } from "./document.ts"
import { Int, Weight, progression } from "@util"

class CharacterLifts<TActor extends CharacterGURPS> {
	declare basicLift: number
	declare oneHandedLift: number
	declare twoHandedLift: number
	declare shove: number
	declare runningShove: number
	declare carryOnBack: number
	declare shiftSlightly: number

	declare map: {
		basicLift: string
		oneHandedLift: string
		twoHandedLift: string
		shove: string
		runningShove: string
		carryOnBack: string
		shiftSlightly: string
	}

	constructor(actor: TActor) {
		this.basicLift = this.getBasicLift(actor)
		this.oneHandedLift = Int.from(this.basicLift * 2)
		this.twoHandedLift = Int.from(this.basicLift * 8)
		this.shove = Int.from(this.basicLift * 12)
		this.runningShove = Int.from(this.basicLift * 24)
		this.carryOnBack = Int.from(this.basicLift * 15)
		this.shiftSlightly = Int.from(this.basicLift * 50)

		const units = SheetSettings.for(actor).default_weight_units
		this.map = {
			basicLift: Weight.format(this.basicLift, units),
			oneHandedLift: Weight.format(this.oneHandedLift, units),
			twoHandedLift: Weight.format(this.twoHandedLift, units),
			shove: Weight.format(this.shove, units),
			runningShove: Weight.format(this.runningShove, units),
			carryOnBack: Weight.format(this.carryOnBack, units),
			shiftSlightly: Weight.format(this.shiftSlightly, units),
		}
	}

	private getBasicLift(actor: TActor): number {
		const ST = actor.liftingST
		let basicLift = ST ** 2 / 5
		if (SheetSettings.for(actor).damage_progression === progression.Option.KnowingYourOwnStrength)
			basicLift = Int.from(2 * 10 ** (ST / 10), 1)
		if (basicLift === Number.MAX_SAFE_INTEGER || basicLift === Number.MIN_SAFE_INTEGER) return 0
		if (basicLift >= 10) return Math.round(basicLift)
		return basicLift
	}
}

export { CharacterLifts }
