import { WeaponRangedData } from "../weapon-ranged.ts"
import fields = foundry.data.fields
import { WeaponField } from "./weapon-field.ts"
import { Int, StringBuilder, TooltipGURPS, feature, wswitch } from "@util"

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
			s = s.toLowerCase()
		}
		return wr
	}

	override toString(): string {
		const buffer = new StringBuilder()
		return buffer.toString()
	}

	override resolveValue(w: WeaponRangedData, tooltip: TooltipGURPS): WeaponRange {
		const result = new WeaponRange({})
		result.clean()
		return result
	}

	override clean(): void {}
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
