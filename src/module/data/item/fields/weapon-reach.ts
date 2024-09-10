import { WeaponMeleeData } from "../weapon-melee.ts"
import fields = foundry.data.fields
import { WeaponField } from "./weapon-field.ts"
import { Int, StringBuilder, TooltipGURPS, feature, wswitch } from "@util"

class WeaponReach extends WeaponField<WeaponMeleeData, WeaponReachSchema> {
	static override defineSchema(): WeaponReachSchema {
		const fields = foundry.data.fields
		return {
			min: new fields.NumberField<number, number, true, false, true>({
				required: true,
				nullable: false,
				initial: 0,
			}),
			max: new fields.NumberField<number, number, true, false, true>({
				required: true,
				nullable: false,
				initial: 0,
			}),
			closeCombat: new fields.BooleanField<boolean>({ required: true, nullable: false, initial: false }),
			changeRequiresReady: new fields.BooleanField<boolean>({ required: true, nullable: false, initial: false }),
		}
	}

	static override fromString(s: string): WeaponReach {
		const wr = new WeaponReach({})
		s = s.replaceAll(" ", "")
		if (s !== "") {
			s = s.toLowerCase()
			if (!s.includes("spec")) {
				s = s.replaceAll("-", ",")
				wr.closeCombat = s.includes("c")
				wr.changeRequiresReady = s.includes("*")
				s = s.replaceAll("*", "")
				const parts = s.split(",")
				;[wr.min] = Int.extract(parts[0])
				if (parts.length > 1) {
					wr.max = Math.max(
						...parts.map(e => {
							const [n] = Int.extract(e)
							return n
						}),
					)
				}
				wr.clean()
			}
		}
		return wr
	}

	override toString(): string {
		const buffer = new StringBuilder()
		if (this.closeCombat) buffer.push("C")
		if (this.min !== 0 || this.max !== 0) {
			if (buffer.length !== 0) buffer.push(",")

			buffer.push(this.min.toString())
			if (this.min !== this.max) {
				buffer.push(`-${this.max}`)
			}
		}
		if (this.changeRequiresReady) buffer.push("*")
		return buffer.toString()
	}

	override resolveValue(w: WeaponMeleeData, tooltip: TooltipGURPS): WeaponReach {
		const result = new WeaponReach({})
		result.closeCombat = w.resolveBoolFlag(wswitch.Type.CloseCombat, result.closeCombat)
		result.changeRequiresReady = w.resolveBoolFlag(
			wswitch.Type.ReachChangeRequiresReady,
			result.changeRequiresReady,
		)
		let [percentMin, percentMax] = [0, 0]
		for (const bonus of w.collectWeaponBonuses(
			1,
			tooltip,
			feature.Type.WeaponMinReachBonus,
			feature.Type.WeaponMaxReachBonus,
		)) {
			const amt = bonus.adjustedAmountForWeapon(w)
			if (bonus.type === feature.Type.WeaponMinReachBonus) {
				if (bonus.percent) percentMin += amt
				else result.min += amt
			} else if (bonus.type === feature.Type.WeaponMaxReachBonus) {
				if (bonus.percent) percentMax += amt
				else result.max += amt
			}
		}
		if (percentMin !== 0) {
			result.min += Int.from((result.min * percentMin) / 100)
		}
		if (percentMax !== 0) {
			result.max += Int.from((result.max * percentMin) / 100)
		}
		result.clean()
		return result
	}

	override clean(): void {
		this.min = Math.max(this.min, 0)
		this.max = Math.max(this.max, 0)
		if (this.min === 0 && this.max !== 0) {
			this.min = 1
		} else if (this.min !== 0 && this.max === 0) {
			this.max = this.min
		}
		this.max = Math.max(this.max, this.min)
	}
}

interface WeaponReach
	extends WeaponField<WeaponMeleeData, WeaponReachSchema>,
		ModelPropsFromSchema<WeaponReachSchema> {}

type WeaponReachSchema = {
	min: fields.NumberField<number, number, true, false, true>
	max: fields.NumberField<number, number, true, false, true>
	closeCombat: fields.BooleanField<boolean, boolean, true, false, true>
	changeRequiresReady: fields.BooleanField<boolean, boolean, true, false, true>
}

export { WeaponReach, type WeaponReachSchema }
