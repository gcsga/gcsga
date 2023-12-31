import { WeaponGURPS } from "@module/config"
import { TooltipGURPS } from "@module/tooltip"
import { Int } from "@util/fxp"
import { wswitch } from "./data"
import { FeatureType } from "@feature"
import { WeaponField } from "./weapon_field"

export class WeaponReach extends WeaponField {
	min = 0

	max = 0

	closeCombat = false

	changeRequiresReady = false

	static parse(s: string): WeaponReach {
		const wr = new WeaponReach()
		s = s.replaceAll(" ", "")
		if (s === "") return wr
		s = s.toLowerCase()
		if (!s.includes("spec")) {
			s = s.replaceAll("-", ",")
			wr.closeCombat = s.includes("c")
			wr.changeRequiresReady = s.includes("*")
			s = s.replaceAll("*", "")
			const parts = s.split(",")
			wr.min = Int.fromString(parts[0])
			if (parts.length > 1) {
				for (const one of parts.slice(1)) {
					const reach = Int.fromString(one)
					if (reach > wr.max) wr.max = reach
				}
			}
			wr.validate()
		}
		return wr
	}

	resolve(w: WeaponGURPS, tooltip: TooltipGURPS): WeaponReach {
		const result = WeaponReach.parse(this.toString())
		result.closeCombat = w.resolveBoolFlag(wswitch.CloseCombat, result.closeCombat)
		result.changeRequiresReady = w.resolveBoolFlag(wswitch.ReachChangeRequiresReady, result.changeRequiresReady)
		for (const bonus of w.collectWeaponBonuses(
			1,
			tooltip,
			FeatureType.WeaponMinReachBonus,
			FeatureType.WeaponMaxReachBonus
		)) {
			if (bonus.type === FeatureType.WeaponMinReachBonus) result.min += bonus.adjustedAmountForWeapon(w)
			if (bonus.type === FeatureType.WeaponMaxReachBonus) result.max += bonus.adjustedAmountForWeapon(w)
		}
		result.validate()
		return result
	}

	toString(): string {
		let buffer = ""
		if (this.closeCombat) buffer += "C"
		if (this.min !== 0 || this.max !== 0) {
			if (buffer.length !== 0) buffer += ","
			buffer += this.min.toString()
			if (this.min !== this.max) buffer += `-${this.max.toString()}`
		}
		if (this.changeRequiresReady) buffer += "*"
		return buffer
	}

	validate() {
		this.min = Math.max(this.min, 0)
		this.max = Math.max(this.max, 0)
		if (this.min === 0 && this.max !== 0) this.min = 1
		else if (this.min !== 0 && this.max === 0) this.max = this.min
		this.max = Math.max(this.max, this.min)
	}
}
