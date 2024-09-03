import { wswitch } from "@util/enum/wswitch.ts"
import { feature } from "@util/enum/feature.ts"
import { WeaponField } from "./weapon-field.ts"
import { AbstractWeaponGURPS } from "./document.ts"
import { Int, TooltipGURPS } from "@util"

export class WeaponShots extends WeaponField {
	count = 0

	inChamber = 0

	duration = 0

	reloadTime = 0

	reloadTimeIsPerShot = false

	thrown = false

	static parse(s: string): WeaponShots {
		const ws = new WeaponShots()
		s = s.toLowerCase().replaceAll(" ", "").replaceAll(",", "")
		if (!s.includes("fp") && !s.includes("hrs") && !s.includes("day")) {
			ws.thrown = s.includes("t")
			if (!s.includes("spec")) {
				;[ws.count, s] = Int.extract(s)
				if (s.startsWith("+")) [ws.inChamber, s] = Int.extract(s)
				if (s.startsWith("x")) [ws.duration, s] = Int.extract(s.slice(1))
				if (s.startsWith("(")) {
					;[ws.reloadTime, s] = Int.extract(s.slice(1))
					ws.reloadTimeIsPerShot = s.includes("i")
				}
			}
		}
		ws.validate()
		return ws
	}

	resolve(w: AbstractWeaponGURPS, tooltip: TooltipGURPS): WeaponShots {
		const result = WeaponShots.parse(this.toString())
		result.reloadTimeIsPerShot = w.resolveBoolFlag(wswitch.Type.ReloadTimeIsPerShot, result.reloadTimeIsPerShot)
		result.thrown = w.resolveBoolFlag(wswitch.Type.Thrown, result.thrown)
		for (const bonus of w.collectWeaponBonuses(
			1,
			tooltip,
			feature.Type.WeaponNonChamberShotsBonus,
			feature.Type.WeaponChamberShotsBonus,
			feature.Type.WeaponShotDurationBonus,
			feature.Type.WeaponReloadTimeBonus,
		)) {
			switch (bonus.type) {
				case feature.Type.WeaponNonChamberShotsBonus:
					result.count += bonus.adjustedAmountForWeapon(w)
					break
				case feature.Type.WeaponChamberShotsBonus:
					result.inChamber += bonus.adjustedAmountForWeapon(w)
					break
				case feature.Type.WeaponShotDurationBonus:
					result.duration += bonus.adjustedAmountForWeapon(w)
					break
				case feature.Type.WeaponReloadTimeBonus:
					result.reloadTime += bonus.adjustedAmountForWeapon(w)
					break
				default:
			}
		}
		result.validate()
		return result
	}

	override toString(): string {
		let buffer = ""
		if (this.thrown) buffer += "T"
		else {
			if (this.count <= 0) return ""
			buffer += this.count.toString()
			if (this.inChamber > 0) buffer += `+${this.inChamber.toString()}`
			if (this.duration > 0) buffer += `x${this.duration.toString()}s`
		}
		if (this.reloadTime > 0) {
			buffer += `(${this.reloadTime.toString() + this.reloadTimeIsPerShot ? "i" : ""})`
		}
		return buffer
	}

	validate(): void {
		this.reloadTime = Math.max(this.reloadTime, 0)
		if (this.thrown) {
			this.count = 0
			this.inChamber = 0
			this.duration = 0
			return
		}
		this.count = Math.max(this.count, 0)
		if (this.count === 0) {
			this.inChamber = 0
			this.duration = 0
			this.reloadTime = 0
			return
		}
		this.inChamber = Math.max(this.inChamber, 0)
		this.duration = Math.max(this.duration, 0)
	}
}
