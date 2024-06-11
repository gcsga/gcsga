import { feature } from "@util/enum/feature.ts"

import { WeaponField } from "./weapon-field.ts"
import { AbstractWeaponGURPS } from "./document.ts"
import { TooltipGURPS } from "@util"
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

	resolve(w: AbstractWeaponGURPS, tooltip: TooltipGURPS): WeaponBulk {
		const result = new WeaponBulk()
		Object.assign(result, this)
		// @ts-expect-error awaiting implementation
		for (const bonus of w.collectWeaponBonuses(1, tooltip, feature.Type.WeaponBulkBonus)) {
			const amt = bonus.adjustedAmountForWeapon(w)
			result.normal += amt
			result.giant += amt
		}
		result.validate()
		return result
	}

	override toString(): string {
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

	validate(): void {
		this.normal = Math.min(this.normal, 0)
		this.giant = Math.min(this.giant, 0)
	}
}
