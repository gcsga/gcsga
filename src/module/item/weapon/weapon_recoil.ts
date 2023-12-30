import { WeaponGURPS } from "@module/config"
import { TooltipGURPS } from "@module/tooltip"
import { Int } from "@util/fxp"
import { FeatureType } from "@feature"
import { WeaponField } from "./weapon_field"

export class WeaponRecoil extends WeaponField {
	shot = 0

	slug = 0

	static parse(s: string): WeaponRecoil {
		const wr = new WeaponRecoil()
		s = s.replaceAll(" ", "").replaceAll(",", "")
		const parts = s.split("/")
		wr.shot = Int.fromString(parts[0])
		if (parts.length > 1) wr.slug = Int.fromString(parts[1])
		wr.validate()
		return wr
	}

	resolve(w: WeaponGURPS, tooltip: TooltipGURPS): WeaponRecoil {
		const result = WeaponRecoil.parse(this.toString())
		if (this.shot > 0 || this.slug > 0) {
			for (const bonus of w.collectWeaponBonuses(1, tooltip, FeatureType.WeaponRecoilBonus)) {
				const amt = bonus.adjustedAmountForWeapon(w)
				result.shot += amt
				result.slug += amt
			}
			if (this.shot > 0) result.shot = Math.max(result.shot, 1)
			else result.shot = 0
			if (this.slug > 0) result.slug = Math.max(result.slug, 1)
			else result.slug = 0
		}
		result.validate()
		return result
	}

	toString(): string {
		if (this.shot === 0 && this.slug === 0) return ""
		let buffer = ""
		buffer += this.shot.toString()
		if (this.slug !== 0) buffer += `/${this.slug.toString()}`
		return buffer
	}

	validate() {
		this.shot = Math.max(this.shot, 0)
		this.slug = Math.max(this.slug, 0)
	}
}
