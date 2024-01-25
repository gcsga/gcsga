import { WeaponField } from "./weapon_field.ts"
import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { wswitch } from "@util/enum/wswitch.ts"
import { WeaponROFMode } from "./weapon_rof_mode.ts"
import { BaseWeaponGURPS } from "./document.ts"
import { LocalizeGURPS } from "@util/localize.ts"
export class WeaponROF extends WeaponField {
	mode1: WeaponROFMode = new WeaponROFMode()

	mode2: WeaponROFMode = new WeaponROFMode()

	jet = false

	static parse(s: string): WeaponROF {
		const wr = new WeaponROF()
		s = s.replaceAll(" ", "").toLowerCase()
		if (s.includes("jet")) {
			wr.jet = true
		} else {
			const parts = s.split("/")
			wr.mode1 = WeaponROFMode.parse(parts[0])
			if (parts.length > 1) wr.mode2 = WeaponROFMode.parse(parts[1])
		}
		wr.validate()
		return wr
	}

	resolve(w: BaseWeaponGURPS, tooltip: TooltipGURPS): WeaponROF {
		const result = WeaponROF.parse(this.toString())
		result.jet = w.resolveBoolFlag(wswitch.Type.Jet, result.jet)
		if (!result.jet) {
			const [buf1, buf2] = [new TooltipGURPS(), new TooltipGURPS()]
			result.mode1 = result.mode1.resolve(w, buf1, true)
			result.mode2 = result.mode2.resolve(w, buf2, false)
			if (buf1.length !== 0)
				tooltip.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.gurps.tooltip.weapon_rof.mode1, {
						content: buf1.toString(),
					}),
				)
			if (buf2.length !== 0)
				tooltip.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.gurps.tooltip.weapon_rof.mode2, {
						content: buf2.toString(),
					}),
				)
		}
		result.validate()
		return result
	}

	override toString(): string {
		if (this.jet) return "Jet"
		const s1 = this.mode1.toString()
		const s2 = this.mode2.toString()
		if (s1 === "") return s2
		if (s2 !== "") return `${s1}/${s2}`
		return s1
	}

	validate(): void {
		if (this.jet) {
			this.mode1 = new WeaponROFMode()
			this.mode2 = new WeaponROFMode()
			return
		}
		this.mode1.validate()
		this.mode2.validate()
	}
}
