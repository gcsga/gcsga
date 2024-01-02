import { WeaponGURPS } from "@module/config"
import { TooltipGURPS } from "@module/tooltip"
import { Int } from "@util/fxp"
import { wswitch } from "./data"
import { WeaponField } from "./weapon_field"
import { feature } from "@util/enum"

export class WeaponAccuracy extends WeaponField {
	base = 0

	scope = 0

	jet = false

	static parse(s: string): WeaponAccuracy {
		const wa = new WeaponAccuracy()
		s = s.replaceAll(" ", "").toLowerCase()
		if (s.includes("jet")) wa.jet = true
		else {
			s = s.replace(/^\+/, "")
			const parts = s.split("+")
				;[wa.base, parts[0]] = Int.extract(parts[0])
			if (parts.length > 1) wa.scope = Int.fromString(parts[1])
		}
		wa.validate()
		return wa
	}

	resolve(w: WeaponGURPS, tooltip: TooltipGURPS): WeaponAccuracy {
		const result = WeaponAccuracy.parse(this.toString())
		result.jet = w.resolveBoolFlag(wswitch.Jet, result.jet)
		if (!result.jet) {
			if (w.actor) {
				for (const bonus of w.collectWeaponBonuses(
					1,
					tooltip,
					feature.Type.WeaponAccBonus,
					feature.Type.WeaponScopeAccBonus
				)) {
					switch (bonus.type) {
						case feature.Type.WeaponAccBonus:
							result.base += bonus.adjustedAmountForWeapon(w)
							break
						case feature.Type.WeaponScopeAccBonus:
							result.scope += bonus.adjustedAmountForWeapon(w)
							break
						default:
					}
				}
			}
		}
		result.validate()
		return result
	}

	toString(): string {
		if (this.jet) return "Jet" // not localized
		if (this.scope !== 0) return this.base.toString() + this.scope.signedString()
		return this.base.toString()
	}

	validate() {
		if (this.jet) {
			this.base = 0
			this.scope = 0
			return
		}
		this.base = Math.max(this.base, 0)
		this.scope = Math.max(this.scope, 0)
	}
}
