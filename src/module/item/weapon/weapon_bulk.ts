import { WeaponGURPS } from "@module/config"
import { TooltipGURPS } from "@module/tooltip"
import { FeatureType } from "@feature"
import { WeaponField } from "./weapon_field"

export class WeaponBulk extends WeaponField {
	normal = 0

	giant = 0

	retractingStock = false

	static parse(s: string): WeaponBulk {
		const wb = new WeaponBulk()
		s = s.replaceAll(" ", "").replaceAll(",", "")
		wb.retractingStock = s.includes("*")
		const parts = s.split("/")
		wb.normal = parseInt(parts[0])
		if (parts.length > 1) wb.giant = parseInt(parts[1])
		wb.validate()
		return wb
	}

	resolve(w: WeaponGURPS, tooltip: TooltipGURPS): WeaponBulk {
		const result = new WeaponBulk()
		Object.assign(result, this)
		for (const bonus of w.collectWeaponBonuses(1, tooltip, FeatureType.WeaponBulkBonus)) {
			const amt = bonus.adjustedAmountForWeapon(w)
			result.normal += amt
			result.giant += amt
		}
		result.validate()
		return result
	}

	toString(): string {
		if (this.normal >= 0 && this.giant >= 0) return ""
		let buffer = ""
		buffer += this.normal.toString()
		if (this.giant !== 0 && this.giant !== this.normal) {
			buffer += "/"
			buffer += this.giant.toString()
		}
		if (this.retractingStock) buffer += "*"
		return buffer
	}

	validate() {
		this.normal = Math.min(this.normal, 0)
		this.giant = Math.min(this.giant, 0)
	}
}
