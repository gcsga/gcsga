import { Int } from "@util/fxp.ts"
import { WeaponField } from "./weapon_field.ts"
import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { feature } from "@util/enum/feature.ts"
import { BaseWeaponGURPS } from "./document.ts"

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

	resolve(w: BaseWeaponGURPS, tooltip: TooltipGURPS): WeaponRecoil {
		const result = WeaponRecoil.parse(this.toString())
		if (this.shot > 0 || this.slug > 0) {
			for (const bonus of w.collectWeaponBonuses(1, tooltip, feature.Type.WeaponRecoilBonus)) {
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

	override toString(): string {
		if (this.shot === 0 && this.slug === 0) return ""
		let buffer = ""
		buffer += this.shot.toString()
		if (this.slug !== 0) buffer += `/${this.slug.toString()}`
		return buffer
	}

	validate(): void {
		this.shot = Math.max(this.shot, 0)
		this.slug = Math.max(this.slug, 0)
	}
}
