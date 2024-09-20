import { DiceGURPS } from "@module/data/dice.ts"
import { ActorBody, HitLocation } from "@module/data/hit-location.ts"
import { DamageType } from "./damage-type.ts"
import { gid } from "@data"

export type HitLocationRollResult = {
	location: HitLocation | undefined
	roll: Roll
}

/**
 *
 * @param text
 */
function convertRollStringToArrayOfInt(text: string) {
	const elements = text.split("-")
	const range = elements.map(it => parseInt(it))

	if (range.length === 0) return []

	for (let i = 0; i < range.length; i++) {
		if (typeof range[i] === "undefined" || isNaN(range[i])) return []
	}

	const results = []
	for (let i = range[0]; i <= range[range.length - 1]; i++) results.push(i)

	return results
}

export const HitLocationUtil = {
	getHitLocation: function (table: ActorBody, location: string): HitLocation | undefined {
		return table.hitLocations.find(it => it.id === location)
	},

	getHitLocationDR: function (location: HitLocation | undefined, damageType: DamageType): number {
		if (!location) return 0
		return location.DR.get(damageType.id) ?? location.DR.get(gid.All) ?? 0
	},

	isFlexibleArmor: function (location: HitLocation | undefined): boolean {
		if (!location) return false
		if (location.DR.has(gid.Flexible)) return location.DR.get(gid.Flexible)! > 0
		return false
	},

	rollRandomLocation: async function (hitLocationTable: ActorBody): Promise<HitLocationRollResult> {
		let result = undefined

		// TODO For Dice So Nice to appear, put this roll into the chat log.
		const roll = Roll.create(DiceGURPS.fromString(hitLocationTable.roll).toString(true))
		// await roll.evaluate({ async: true })
		await roll.evaluate()
		const rollTotal = roll.total!

		for (const location of hitLocationTable.hitLocations) {
			const x: number[] = convertRollStringToArrayOfInt(location.rollRange)
			if (x.includes(rollTotal)) {
				result = location
			}
		}

		return {
			location: result,
			roll: roll,
		}
	},
}
