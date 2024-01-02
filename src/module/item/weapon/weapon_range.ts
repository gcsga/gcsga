import { WeaponGURPS } from "@module/config"
import { TooltipGURPS } from "@module/tooltip"
import { Int } from "@util/fxp"
import { wswitch } from "./data"
import { WeaponField } from "./weapon_field"
import { feature } from "@util/enum"

export class WeaponRange extends WeaponField {
	halfDamage = 0

	min = 0

	max = 0

	musclePowered = false

	inMiles = false

	static parse(s: string): WeaponRange {
		const wr = new WeaponRange()
		s = s.toLowerCase().replaceAll(" ", "").replaceAll("×", "x")
		if (
			!s.includes("sight") &&
			!s.includes("spec") &&
			!s.includes("skill") &&
			!s.includes("point") &&
			!s.includes("pbaoe") &&
			!s.startsWith("b")
		) {
			s = s.replaceAll(",max", "/")
			s = s.replaceAll("max", "")
			s = s.replaceAll("1/2d", "")
			wr.musclePowered = s.includes("x")
			s = s.replaceAll("x", "")
			s = s.replaceAll("st", "")
			s = s.replaceAll("c/", "")
			wr.inMiles = s.includes("mi")
			s = s.replaceAll("mi.", "")
			s = s.replaceAll("mi", "")
			s = s.replaceAll(",", "")
			let parts = s.split("/")
			if (parts.length > 1) {
				wr.halfDamage = Int.fromString(parts[0])
				parts[0] = parts[1]
			}
			parts = parts[0].split("-")
			if (parts.length > 1) {
				wr.min = Int.fromString(parts[0])
				wr.max = Int.fromString(parts[1])
			} else {
				wr.max = Int.fromString(parts[0])
			}
		}
		wr.validate()
		return wr
	}

	resolve(w: WeaponGURPS, tooltip: TooltipGURPS): WeaponRange {
		const result = new WeaponRange()
		Object.assign(result, this)
		result.musclePowered = w.resolveBoolFlag(wswitch.MusclePowered, result.musclePowered)
		result.inMiles = w.resolveBoolFlag(wswitch.RangeInMiles, result.inMiles)
		if (result.musclePowered) {
			let st = 0
			if (w.container instanceof Item) st = (w.container as any).ratedStrength
			if (st === 0) {
				if (w.actor) st = w.actor.throwingST
			}
			if (st > 0) {
				result.halfDamage = Math.max(0, Math.trunc(result.halfDamage * st))
				result.min = Math.max(0, Math.trunc(result.min * st))
				result.max = Math.max(0, Math.trunc(result.max * st))
			}
		}
		for (const bonus of w.collectWeaponBonuses(
			1,
			tooltip,
			feature.Type.WeaponHalfDamageRangeBonus,
			feature.Type.WeaponMinRangeBonus,
			feature.Type.WeaponMaxRangeBonus
		)) {
			switch (bonus.type) {
				case feature.Type.WeaponHalfDamageRangeBonus:
					result.halfDamage += bonus.adjustedAmountForWeapon(w)
					break
				case feature.Type.WeaponMinRangeBonus:
					result.min += bonus.adjustedAmountForWeapon(w)
					break
				case feature.Type.WeaponMaxRangeBonus:
					result.max += bonus.adjustedAmountForWeapon(w)
					break
				default:
			}
		}
		result.validate()
		return result
	}

	toString(musclePoweredIsResolved: boolean): string {
		let buffer = ""
		if (this.halfDamage !== 0) {
			if (this.musclePowered && !musclePoweredIsResolved) buffer = String(buffer)
			buffer += this.halfDamage.toString()
			buffer += "/"
		}
		if (this.min !== 0 || this.max !== 0) {
			if (this.min !== 0 && this.min !== this.max) {
				if (this.musclePowered && !musclePoweredIsResolved) buffer += "x"
				buffer += this.min.toString()
				buffer += "-"
			}
			if (this.musclePowered && !musclePoweredIsResolved) buffer += "x"
			buffer += this.max.toString()
		}
		if (this.inMiles && buffer.length !== 0) {
			buffer += " "
			buffer += "mi" // not localized
		}

		return buffer
	}

	validate() {
		this.halfDamage = Math.max(this.halfDamage, 0)
		this.min = Math.max(this.min, 0)
		this.max = Math.max(this.max, 0)
		if (this.min > this.max) [this.min, this.max] = [this.max, this.min]
		if (this.halfDamage < this.min || this.halfDamage >= this.max) this.halfDamage = 0
	}
}
