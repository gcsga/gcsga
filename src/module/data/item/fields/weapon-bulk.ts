import fields = foundry.data.fields
import { WeaponField } from "./weapon-field.ts"
import { Int, LocalizeGURPS, StringBuilder, TooltipGURPS, feature } from "@util"
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

	// Tooltip returns a tooltip for the data, if any. Call .resolve() prior to calling this method if you want the tooltip
	// to be based on the resolved values.
	override tooltip(w: WeaponRangedData): string {
		if (!this.retractingStock) return ""
		if (this.normal < 0) this.normal += 1
		if (this.giant < 0) this.giant += 1
		this.clean()

		const accuracy = w.accuracy.resolve(w, null)
		accuracy.base -= 1
		accuracy.clean()
		const recoil = w.recoil.resolve(w, null)
		if (recoil.shot > 1) recoil.shot += 1
		if (recoil.slug > 1) recoil.slug += 1
		recoil.clean()
		const minST = w.strength.resolve(w, null)
		minST.min = Math.ceil(minST.min * 1.2)
		minST.clean()

		return LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Tooltip.RetractingStock, {
			bulk: this.toString(),
			accuracy: accuracy.toString(),
			recoil: recoil.toString(),
			strength: minST.toString(),
		})
	}

	override resolve(w: WeaponRangedData, tooltip: TooltipGURPS): WeaponBulk {
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
