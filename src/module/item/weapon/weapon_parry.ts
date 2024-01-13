import { WeaponGURPS } from "@module/config"
import { TooltipGURPS } from "@module/tooltip"
import { Int } from "@util/fxp"
import { gid } from "@module/data"
import { WeaponField } from "./weapon_field"
import { feature, wswitch } from "@util/enum"

export class WeaponParry extends WeaponField {
	no = false

	fencing = false

	unbalanced = false

	modifier = 0

	static parse(s: string): WeaponParry {
		const wp = new WeaponParry()
		s = s.toLowerCase()
		wp.no = s.includes("no")
		if (!wp.no) {
			wp.fencing = s.includes("f")
			wp.unbalanced = s.includes("u")
			wp.modifier = Int.fromString(s)
		}
		wp.validate()
		return wp
	}

	resolve(w: WeaponGURPS, tooltip: TooltipGURPS | null): WeaponParry {
		const result = WeaponParry.parse(this.toString())
		result.no = !w.resolveBoolFlag(wswitch.Type.CanParry, !result.no)
		result.fencing = w.resolveBoolFlag(wswitch.Type.Fencing, result.fencing)
		result.unbalanced = w.resolveBoolFlag(wswitch.Type.Unbalanced, result.unbalanced)
		if (!result.no) {
			const actor = w.actor
			if (actor !== null) {
				let primaryTooltip: TooltipGURPS | null = null
				if (tooltip !== null) primaryTooltip = new TooltipGURPS()
				const preAdj = w.skillLevelBaseAdjustment(actor, primaryTooltip)
				const postAdj = w.skillLevelPostAdjustment(actor, primaryTooltip)
				let best = -Infinity
				for (const def of w.defaults) {
					let level = def.skillLevelFast(actor, false, null, true)
					if (level === -Infinity) continue
					level += preAdj
					if (def.type !== gid.Parry) level = Math.trunc(level / 2)
					level += postAdj
					if (best < level) best = level
				}
				if (best !== -Infinity) {
					if (primaryTooltip !== null) tooltip?.push("\n", primaryTooltip)
					result.modifier += 3 + best + actor.parryBonus
					for (const bonus of w.collectWeaponBonuses(1, tooltip, feature.Type.WeaponParryBonus)) {
						result.modifier += bonus.adjustedAmountForWeapon(w)
					}
					result.modifier = Math.trunc(Math.max(result.modifier, 0))
				} else result.modifier = 0
			}
		}
		result.validate()
		return result
	}

	toString(): string {
		if (this.no) return "No" // not localized
		if (this.modifier === 0 && !this.fencing && !this.unbalanced) return ""
		let buffer = ""
		buffer += this.modifier.toString()
		if (this.fencing) buffer += "F"
		if (this.unbalanced) buffer += "U"
		return buffer
	}

	validate() {
		if (this.no) {
			this.modifier = 0
			this.fencing = false
			this.unbalanced = false
		}
	}
}
