import { AbstractWeaponTemplate } from "../templates/index.ts"
import fields = foundry.data.fields
import { WeaponField } from "./weapon-field.ts"
import { Int, Length, StringBuilder, TooltipGURPS, feature, wswitch } from "@util"

class WeaponRange extends WeaponField<AbstractWeaponTemplate, WeaponRangeSchema> {
	static override defineSchema(): WeaponRangeSchema {
		const fields = foundry.data.fields
		return {
			halfDamage: new fields.NumberField<number, number, true, false, true>({
				required: true,
				nullable: false,
				initial: 0,
			}),
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
			musclePowered: new fields.BooleanField<boolean>({ required: true, nullable: false, initial: false }),
			inMiles: new fields.BooleanField<boolean>({ required: true, nullable: false, initial: false }),
		}
	}

	static override fromString(s: string): WeaponRange {
		const wr = new WeaponRange().toObject()
		s = s.replaceAll(" ", "")
		if (s !== "") {
			s = s.toLowerCase().replaceAll(" ", "").replaceAll("×", "x")
			if (
				s.includes("sight") &&
				s.includes("spec") &&
				s.includes("skill") &&
				s.includes("point") &&
				s.includes("pbaoe") &&
				s.startsWith("b")
			) {
				s = s.replaceAll(",max", "/").replaceAll("max", "").replaceAll("1/2d", "")
				wr.musclePowered = s.includes("x")
				s = s.replaceAll("x", "").replaceAll("st", "").replaceAll("c/", "")
				wr.inMiles = s.includes("mi")
				s = s.replaceAll("mi.", "").replaceAll("mi", "").replaceAll(",", "")
				let parts = s.split("/")
				if (parts.length > 1) {
					;[wr.halfDamage] = Int.extract(parts[0])
					parts[0] = parts[1]
				}
				parts = parts[0].split("-")
				if (parts.length > 1) {
					;[wr.min] = Int.extract(parts[0])
					;[wr.max] = Int.extract(parts[1])
				} else {
					;[wr.max] = Int.extract(parts[0])
				}
			}
		}
		return new WeaponRange(wr)
	}

	override toString(musclePowerIsresolved: boolean): string {
		const buffer = new StringBuilder()
		if (this.halfDamage !== 0) {
			if (this.musclePowered && !musclePowerIsresolved) {
				buffer.push("x")
			}
			buffer.push(this.halfDamage.toLocaleString())
			buffer.push("/")
		}
		if (this.min !== 0 || this.max !== 0) {
			if (this.min !== 0 && this.min !== this.max) {
				if (this.musclePowered && !musclePowerIsresolved) {
					buffer.push("x")
				}
				buffer.push(this.min.toLocaleString())
				buffer.push("-")
			}
			if (this.musclePowered && !musclePowerIsresolved) {
				buffer.push("x")
			}
			buffer.push(this.max.toLocaleString())
		}
		if (this.inMiles && buffer.length !== 0) {
			buffer.push(" ", Length.Unit.Mile)
		}
		return buffer.toString()
	}

	override resolve(w: AbstractWeaponTemplate, tooltip: TooltipGURPS | null): WeaponRange {
		const result = this.toObject()
		result.musclePowered = w.resolveBoolFlag(wswitch.Type.MusclePowered, result.musclePowered)
		result.inMiles = w.resolveBoolFlag(wswitch.Type.RangeInMiles, result.inMiles)

		if (result.musclePowered) {
			let st = 0
			if (this.item.container !== null) {
				// HACK: to fix with proper Promise support
				if (!(this.item.container instanceof Promise)) {
					st = this.item.container.system.ratedStrength
				}
			}
			if (st > 0) {
				result.halfDamage = Math.max(Math.trunc(result.halfDamage * st), 0)
				result.min = Math.max(Math.trunc(result.min * st), 0)
				result.max = Math.max(Math.trunc(result.max * st), 0)
			}
		}
		let [percentHalfDamage, percentMin, percentMax] = [0, 0, 0]
		for (const bonus of w.collectWeaponBonuses(
			1,
			tooltip,
			feature.Type.WeaponHalfDamageRangeBonus,
			feature.Type.WeaponMinRangeBonus,
			feature.Type.WeaponMaxRangeBonus,
		)) {
			const amt = bonus.adjustedAmountForWeapon(w)
			switch (bonus.type) {
				case feature.Type.WeaponHalfDamageRangeBonus:
					if (bonus.percent) percentHalfDamage += amt
					else result.halfDamage += amt
					break
				case feature.Type.WeaponMinRangeBonus:
					if (bonus.percent) percentMin += amt
					else result.min += amt
					break
				case feature.Type.WeaponMaxRangeBonus:
					if (bonus.percent) percentMax += amt
					else result.max += amt
			}
		}
		if (percentHalfDamage !== 0) result.halfDamage += Math.trunc((result.halfDamage * percentHalfDamage) / 100)
		if (percentMin !== 0) result.min += Math.trunc((result.min * percentMin) / 100)
		if (percentMax !== 0) result.max += Math.trunc((result.max * percentMax) / 100)

		return new WeaponRange(result)
	}

	static override cleanData(
		source?: object | undefined,
		options?: Record<string, unknown> | undefined,
	): SourceFromSchema<fields.DataSchema> {
		let { halfDamage, min, max }: Partial<SourceFromSchema<WeaponRangeSchema>> = {
			halfDamage: 0,
			min: 0,
			max: 0,
			...source,
		}

		halfDamage = Math.max(halfDamage, 0)
		min = Math.max(min, 0)
		max = Math.max(max, 0)
		if (min > max) {
			;[min, max] = [max, min]
		}
		if (halfDamage < min || halfDamage >= max) {
			halfDamage = 0
		}

		return super.cleanData({ ...source, min, max, halfDamage }, options)
	}
}

interface WeaponRange
	extends WeaponField<AbstractWeaponTemplate, WeaponRangeSchema>,
		ModelPropsFromSchema<WeaponRangeSchema> {}

type WeaponRangeSchema = {
	halfDamage: fields.NumberField<number, number, true, false, true>
	min: fields.NumberField<number, number, true, false, true>
	max: fields.NumberField<number, number, true, false, true>
	musclePowered: fields.BooleanField<boolean, boolean, true, false, true>
	inMiles: fields.BooleanField<boolean, boolean, true, false, true>
}

export { WeaponRange, type WeaponRangeSchema }
