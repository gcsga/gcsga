import { WeaponGURPS } from "@module/config"
import { TooltipGURPS } from "@module/tooltip"
import { wswitch } from "./data"
import { Int } from "@util/fxp"
import { FeatureType, WeaponBonusType } from "@feature"

export class WeaponROFMode {
	shotsPerAttack = 0

	secondaryProjectiles = 0

	fullAutoOnly = false

	highCyclicControlledBursts = false

	static parse(s: string): WeaponROFMode {
		const wr = new WeaponROFMode()
		s = s.replaceAll(" ", "").toLowerCase().replaceAll(".", "x")
		wr.fullAutoOnly = s.includes("!")
		s = s.replaceAll("!", "")
		wr.highCyclicControlledBursts = s.includes("#")
		s = s.replaceAll("#", "").replaceAll("×", "x")
		if (s.startsWith("x")) s = `1${s}`
		const parts = s.split("x")
		wr.shotsPerAttack = Int.fromString(s)
		if (parts.length > 1) wr.secondaryProjectiles = Int.fromString(parts[1])
		wr.validate()
		return wr
	}

	resolve(w: WeaponGURPS, tooltip: TooltipGURPS, firstMode: boolean): WeaponROFMode {
		const result = WeaponROFMode.parse(this.toString())
		let [shotsFeature, secondaryFeature]: WeaponBonusType[] = [
			FeatureType.WeaponRofMode1ShotsBonus,
			FeatureType.WeaponRofMode1SecondaryBonus,
		]
		if (firstMode) {
			result.fullAutoOnly = w.resolveBoolFlag(wswitch.FullAuto1, result.fullAutoOnly)
			result.highCyclicControlledBursts = w.resolveBoolFlag(
				wswitch.ControlledBursts1,
				result.highCyclicControlledBursts
			)
		} else {
			shotsFeature = FeatureType.WeaponRofMode2ShotsBonus
			secondaryFeature = FeatureType.WeaponRofMode2SecondaryBonus
			result.fullAutoOnly = w.resolveBoolFlag(wswitch.FullAuto2, result.fullAutoOnly)
			result.highCyclicControlledBursts = w.resolveBoolFlag(
				wswitch.ControlledBursts2,
				result.highCyclicControlledBursts
			)
		}
		for (const bonus of w.collectWeaponBonuses(1, tooltip, shotsFeature, secondaryFeature)) {
			if (bonus.type === shotsFeature) result.shotsPerAttack += bonus.adjustedAmountForWeapon(w)
			else if (bonus.type === secondaryFeature) {
				result.secondaryProjectiles += bonus.adjustedAmountForWeapon(w)
			}
		}
		result.validate()
		return result
	}

	toString(): string {
		if (this.shotsPerAttack <= 0) return ""
		let buffer = ""
		buffer += this.shotsPerAttack.toString()
		if (this.secondaryProjectiles > 0) buffer += `x${this.secondaryProjectiles.toString()}`
		if (this.fullAutoOnly) buffer += "!"
		if (this.highCyclicControlledBursts) buffer += "#"
		return buffer
	}

	validate(): void {
		this.shotsPerAttack = Math.max(this.shotsPerAttack, 0)
		if (this.shotsPerAttack === 0) {
			this.secondaryProjectiles = 0
			this.fullAutoOnly = false
			this.highCyclicControlledBursts = false
			return
		}
		this.secondaryProjectiles = Math.max(Math.ceil(this.secondaryProjectiles), 0)
	}
}
