import fields = foundry.data.fields
import { WeaponField } from "./weapon-field.ts"
import { Int, LocalizeGURPS, StringBuilder, TooltipGURPS, feature, wswitch } from "@util"
import { AbstractWeaponTemplate } from "../templates/index.ts"

class WeaponReach extends WeaponField<AbstractWeaponTemplate, WeaponReachSchema> {
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
		const wr = new WeaponReach({}).toObject()
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
			}
		}
		return new WeaponReach(wr)
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

	override tooltip(_w: AbstractWeaponTemplate): string {
		if (this.changeRequiresReady) return LocalizeGURPS.translations.GURPS.Tooltip.ReachChangeRequiresReady
		return ""
	}

	override resolve(w: AbstractWeaponTemplate, tooltip: TooltipGURPS | null): WeaponReach {
		const result = this.toObject()
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
		return new WeaponReach(result)
	}

	static override cleanData(
		source?: object | undefined,
		options?: Record<string, unknown> | undefined,
	): SourceFromSchema<fields.DataSchema> {
		let { min, max } = { min: 0, max: 0, ...source }
		if (min === 0 && max !== 0) {
			min = 1
		} else if (min !== 0 && max === 0) {
			max = min
		}
		max = Math.max(max, min)
		return super.cleanData({ min, max }, options)
	}
}

interface WeaponReach
	extends WeaponField<AbstractWeaponTemplate, WeaponReachSchema>,
		ModelPropsFromSchema<WeaponReachSchema> {}

type WeaponReachSchema = {
	min: fields.NumberField<number, number, true, false, true>
	max: fields.NumberField<number, number, true, false, true>
	closeCombat: fields.BooleanField<boolean, boolean, true, false, true>
	changeRequiresReady: fields.BooleanField<boolean, boolean, true, false, true>
}

export { WeaponReach, type WeaponReachSchema }
