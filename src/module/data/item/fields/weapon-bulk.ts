import fields = foundry.data.fields
import { WeaponField } from "./weapon-field.ts"
import { Int, StringBuilder, TooltipGURPS, feature } from "@util"
import { WeaponRangedData } from "../weapon-ranged.ts"

class WeaponBulk extends WeaponField<WeaponRangedData, WeaponBulkSchema> {
	static override defineSchema(): WeaponBulkSchema {
		const fields = foundry.data.fields
		return {
			normal: new fields.NumberField<number, number, true, false, true>({
				required: true,
				nullable: false,
				initial: 0,
			}),
			giant: new fields.NumberField<number, number, true, false, true>({
				required: true,
				nullable: false,
				initial: 0,
			}),
			retractingStock: new fields.BooleanField<boolean>({ required: true, nullable: false, initial: false }),
		}
	}

	static override fromString(s: string): WeaponBulk {
		const wb = new WeaponBulk({})
		s = s.replaceAll(" ", "").replaceAll(",", "")
		wb.retractingStock = s.includes("*")
		const parts = s.split("/")
		;[wb.normal] = Int.extract(parts[0])
		if (parts.length > 1) {
			;[wb.giant] = Int.extract(parts[1])
		}
		wb.clean()
		return wb
	}

	override toString(): string {
		if (this.normal >= 0 && this.giant >= 0) return ""
		const buffer = new StringBuilder()
		buffer.push(this.normal.toString())
		if (this.giant !== 0 && this.giant !== this.normal) buffer.push("/", this.giant.toString())
		if (this.retractingStock) buffer.push("*")
		return buffer.toString()
	}

	override resolveValue(w: WeaponRangedData, tooltip: TooltipGURPS): WeaponBulk {
		const result = this.clone()
		let percent = 0
		for (const bonus of w.collectWeaponBonuses(1, tooltip, feature.Type.WeaponBulkBonus)) {
			const amt = bonus.adjustedAmountForWeapon(w)
			if (bonus.percent) {
				percent += amt
			} else {
				result.normal += amt
				result.giant += amt
			}
		}
		if (percent !== 0) {
			result.normal == Math.trunc((result.normal * percent) / 100)
			result.giant == Math.trunc((result.giant * percent) / 100)
		}
		result.clean()
		return result
	}

	override clean(): void {
		this.normal = Math.min(this.normal, 0)
		this.giant = Math.min(this.giant, 0)
	}
}

interface WeaponBulk extends WeaponField<WeaponRangedData, WeaponBulkSchema>, ModelPropsFromSchema<WeaponBulkSchema> {}

type WeaponBulkSchema = {
	normal: fields.NumberField<number, number, true, false, true>
	giant: fields.NumberField<number, number, true, false, true>
	retractingStock: fields.BooleanField<boolean, boolean, true, false, true>
}

export { WeaponBulk, type WeaponBulkSchema }
