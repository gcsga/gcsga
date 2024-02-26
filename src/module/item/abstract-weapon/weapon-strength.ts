import { Int } from "@util/fxp.ts"
import { WeaponField } from "./weapon-field.ts"
import { wswitch } from "@util/enum/wswitch.ts"
import { feature } from "@util/enum/feature.ts"
import { ItemType } from "@data"
import { ItemGURPS } from "@item/base/document.ts"
import { AbstractWeaponGURPS } from "./document.ts"
import { TooltipGURPS } from "@util"

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

	resolve(w: AbstractWeaponGURPS, tooltip: TooltipGURPS | null): WeaponStrength {
		const result = new WeaponStrength()
		Object.assign(result, this)
		if (w.actor) {
			if (
				// @ts-expect-error awaiting implementation
				w.container instanceof ItemGURPS &&
				// @ts-expect-error awaiting implementation
				(w.container.type === ItemType.Equipment || w.container.type === ItemType.EquipmentContainer)
			) {
				// @ts-expect-error awaiting implementation
				const st = Math.max(w.container.ratedStrength, 0)
				if (st !== 0) result.min = st
			}
		}
		// @ts-expect-error awaiting implementation
		result.bipod = w.resolveBoolFlag(wswitch.Type.Bipod, result.bipod ?? false)
		// @ts-expect-error awaiting implementation
		result.mounted = w.resolveBoolFlag(wswitch.Type.Mounted, result.mounted ?? false)
		// @ts-expect-error awaiting implementation
		result.musketRest = w.resolveBoolFlag(wswitch.Type.MusketRest, result.musketRest ?? false)
		// @ts-expect-error awaiting implementation
		result.twoHanded = w.resolveBoolFlag(wswitch.Type.TwoHanded, result.twoHanded ?? false)
		// @ts-expect-error awaiting implementation
		result.twoHandedUnready = w.resolveBoolFlag(
			wswitch.Type.TwoHandedAndUnreadyAfterAttack,
			result.twoHandedUnready ?? false,
		)
		result.min ??= 0
		// @ts-expect-error awaiting implementation
		for (const bonus of w.collectWeaponBonuses(1, tooltip, feature.Type.WeaponMinSTBonus))
			result.min += bonus.adjustedAmountForWeapon(w)
		result.validate()

		return result
	}

	override toString(): string {
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

	validate(): void {
		if (this.twoHandedUnready) this.twoHanded = false
	}
}
