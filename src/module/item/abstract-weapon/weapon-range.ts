import { Int } from "@util/fxp.ts"
import { WeaponField } from "./weapon-field.ts"
import { wswitch } from "@util/enum/wswitch.ts"
import { feature } from "@util/enum/feature.ts"
import { AbstractWeaponGURPS, EquipmentContainerGURPS, EquipmentGURPS } from "@item"
import { CharacterGURPS } from "@actor"
import { TooltipGURPS } from "@util"
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

	resolve(w: AbstractWeaponGURPS, tooltip: TooltipGURPS): WeaponRange {
		const result = new WeaponRange()
		Object.assign(result, this)
		// @ts-expect-error awaiting implementation
		result.musclePowered = w.resolveBoolFlag(wswitch.Type.MusclePowered, result.musclePowered)
		// @ts-expect-error awaiting implementation
		result.inMiles = w.resolveBoolFlag(wswitch.Type.RangeInMiles, result.inMiles)
		if (result.musclePowered) {
			let st = 0
			// @ts-expect-error awaiting implementation
			if (w.container instanceof (EquipmentGURPS || EquipmentContainerGURPS)) st = w.container.ratedStrength
			if (st === 0) {
				// @ts-expect-error awaiting implementation
				if (w.actor instanceof CharacterGURPS) st = w.actor.throwingST
			}
			if (st > 0) {
				result.halfDamage = Math.max(0, Math.trunc(result.halfDamage * st))
				result.min = Math.max(0, Math.trunc(result.min * st))
				result.max = Math.max(0, Math.trunc(result.max * st))
			}
		}
		// @ts-expect-error awaiting implementation
		for (const bonus of w.collectWeaponBonuses(
			1,
			tooltip,
			feature.Type.WeaponHalfDamageRangeBonus,
			feature.Type.WeaponMinRangeBonus,
			feature.Type.WeaponMaxRangeBonus,
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

	override toString(musclePoweredIsResolved: boolean): string {
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

	validate(): void {
		this.halfDamage = Math.max(this.halfDamage, 0)
		this.min = Math.max(this.min, 0)
		this.max = Math.max(this.max, 0)
		if (this.min > this.max) [this.min, this.max] = [this.max, this.min]
		if (this.halfDamage < this.min || this.halfDamage >= this.max) this.halfDamage = 0
	}
}
