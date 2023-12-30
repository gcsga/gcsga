import { TooltipGURPS } from "@module/tooltip"
import { Int } from "@util/fxp"
import { wswitch } from "./data"
import { FeatureType } from "@feature"
import { BaseWeaponGURPS } from "./document"
import { WeaponField } from "./weapon_field"

export class WeaponStrength extends WeaponField {
	min?: number

	bipod?: boolean

	mounted?: boolean

	musketRest?: boolean

	twoHanded?: boolean

	twoHandedUnready?: boolean

	static parse(s: string): WeaponStrength {
		const ws = new WeaponStrength()
		s = s.trim()
		if (s !== "") {
			s = s.toLowerCase()
			ws.bipod = s.includes("b")
			ws.mounted = s.includes("m")
			ws.musketRest = s.includes("r")
			ws.twoHanded = s.includes("†") || s.includes("*")
			ws.twoHandedUnready = s.includes("‡")
			;[ws.min] = Int.extract(s)
			ws.validate()
		}
		return ws
	}

	resolve(w: BaseWeaponGURPS<any>, tooltip: TooltipGURPS | null): WeaponStrength {
		const result = new WeaponStrength()
		Object.assign(result, this)
		if (w.actor) {
			if (w.container instanceof Item) {
				const st = Math.max((w.container as any).ratedStrength, 0)
				if (st !== 0) result.min = st
			}
		}
		result.bipod = w.resolveBoolFlag(wswitch.Bipod, result.bipod ?? false)
		result.mounted = w.resolveBoolFlag(wswitch.Mounted, result.mounted ?? false)
		result.musketRest = w.resolveBoolFlag(wswitch.MusketRest, result.musketRest ?? false)
		result.twoHanded = w.resolveBoolFlag(wswitch.TwoHanded, result.twoHanded ?? false)
		result.twoHandedUnready = w.resolveBoolFlag(
			wswitch.TwoHandedAndUnreadyAfterAttack,
			result.twoHandedUnready ?? false
		)
		result.min ??= 0
		for (const bonus of w.collectWeaponBonuses(1, tooltip, FeatureType.WeaponMinSTBonus))
			result.min += bonus.adjustedAmountForWeapon(w)
		result.validate()

		return result
	}

	toString(): string {
		let buffer = ""
		if (this.min && this.min > 0) buffer += this.min.toString()
		if (this.bipod) buffer += "B"
		if (this.mounted) buffer += "M"
		if (this.musketRest) buffer += "R"
		if (this.twoHanded || this.twoHandedUnready) {
			if (this.twoHandedUnready) buffer += "‡"
			else buffer += "†"
		}

		return buffer
	}

	validate() {
		if (this.twoHandedUnready) this.twoHanded = false
	}
}
