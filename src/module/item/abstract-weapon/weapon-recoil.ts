import { WeaponField } from "./weapon-field.ts"
import { feature } from "@util/enum/feature.ts"
import { AbstractWeaponGURPS } from "./document.ts"
import { Int, TooltipGURPS } from "@util"

export class WeaponRecoil extends WeaponField {
	shot = 0
	slug = 0

	static parse(s: string): WeaponRecoil {
		const wr = new WeaponRecoil()
		s = s.replaceAll(" ", "").replaceAll(",", "")
		const parts = s.split("/")
		wr.shot = Int.fromString(parts[0])[0]
		if (parts.length > 1) wr.slug = Int.fromString(parts[1])[0]
		wr.validate()
		return wr
	}

	resolve(w: AbstractWeaponGURPS, tooltip: TooltipGURPS | null = null): WeaponRecoil {
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
