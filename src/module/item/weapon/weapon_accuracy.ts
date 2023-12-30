import { WeaponGURPS } from "@module/config"
import { TooltipGURPS } from "@module/tooltip"
import { Int } from "@util/fxp"
import { wswitch } from "./data"
import { FeatureType } from "@feature"

export class WeaponAccuracy {
	base = 0

	scope = 0

	jet = false

	static parse(s: string): WeaponAccuracy {
		const wa = new WeaponAccuracy()
		s = s.replaceAll(" ", "").toLowerCase()
		if (s.includes("jet")) wa.jet = true
		else {
			s = s.replace(/^+/, "")
			const parts = s.split("+")
			;[wa.base, parts[0]] = Int.extract(parts[0])
			if (parts.length > 1) wa.scope = Int.fromString(parts[1])
		}
		wa.validate()
		return wa
	}

	resolve(w: WeaponGURPS, tooltip: TooltipGURPS): WeaponAccuracy {
		const result = new WeaponAccuracy()
		Object.assign(result, this)
		result.jet = w.resolveBoolFlag(wswitch.Jet, result.jet)
		if (!result.jet) {
			if (w.actor) {
				for (const bonus of w.collectWeaponBonuses(
					1,
					tooltip,
					FeatureType.WeaponAccBonus,
					FeatureType.WeaponScopeAccBonus
				)) {
					switch (bonus.type) {
						case FeatureType.WeaponAccBonus:
							result.base += bonus.adjustedAmountForWeapon(w)
							break
						case FeatureType.WeaponScopeAccBonus:
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
