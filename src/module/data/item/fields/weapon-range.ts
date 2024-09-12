import { WeaponRangedData } from "../weapon-ranged.ts"
import fields = foundry.data.fields
import { WeaponField } from "./weapon-field.ts"
import { Int, Length, StringBuilder, TooltipGURPS, feature, wswitch } from "@util"
import { ItemType } from "@module/data/constants.ts"

class WeaponRange extends WeaponField<WeaponRangedData, WeaponRangeSchema> {
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
		const wr = new WeaponRange({})
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
				wr.clean()
			}
		}
		return wr
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

	override resolveValue(w: WeaponRangedData, tooltip: TooltipGURPS): WeaponRange {
		const result = this.clone()
		result.musclePowered = w.resolveBoolFlag(wswitch.Type.MusclePowered, result.musclePowered)
		result.inMiles = w.resolveBoolFlag(wswitch.Type.RangeInMiles, result.inMiles)

		if (result.musclePowered) {
			let st = 0
			if (this.item.container !== null) {
				// HACK: to fix with proper Promise support
				if (
					!(this.item.container instanceof Promise) &&
					this.item.container.isOfType(ItemType.Equipment, ItemType.EquipmentContainer)
				) {
					st = this.item.container.system.rated_strength
				}
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

		result.clean()
		return result
	}

	override clean(): void {
		this.halfDamage = Math.max(this.halfDamage, 0)
		this.min = Math.max(this.min, 0)
		this.max = Math.max(this.max, 0)
		if (this.min > this.max) {
			;[this.min, this.max] = [this.max, this.min]
		}
		if (this.halfDamage < this.min || this.halfDamage >= this.max) {
			this.halfDamage = 0
		}
	}
}

interface WeaponRange
	extends WeaponField<WeaponRangedData, WeaponRangeSchema>,
		ModelPropsFromSchema<WeaponRangeSchema> {}

type WeaponRangeSchema = {
	halfDamage: fields.NumberField<number, number, true, false, true>
	min: fields.NumberField<number, number, true, false, true>
	max: fields.NumberField<number, number, true, false, true>
	musclePowered: fields.BooleanField<boolean, boolean, true, false, true>
	inMiles: fields.BooleanField<boolean, boolean, true, false, true>
}

export { WeaponRange, type WeaponRangeSchema }