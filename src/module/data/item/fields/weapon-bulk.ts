import { AbstractWeaponTemplate } from "../templates/index.ts"
import { WeaponField } from "./weapon-field.ts"
import { Int, LocalizeGURPS, StringBuilder, TooltipGURPS, feature } from "@util"
import { ItemType } from "@module/data/constants.ts"
import { ToggleableBooleanField, ToggleableNumberField } from "@module/data/fields/index.ts"

class WeaponBulk extends WeaponField<AbstractWeaponTemplate, WeaponBulkSchema> {
	static override defineSchema(): WeaponBulkSchema {
		return {
			normal: new ToggleableNumberField({
				required: true,
				nullable: false,
				min: 0,
				initial: 0,
			}),
			giant: new ToggleableNumberField({
				required: true,
				nullable: false,
				min: 0,
				initial: 0,
			}),
			retractingStock: new ToggleableBooleanField({ required: true, nullable: false, initial: false }),
		}
	}

	static override fromString(s: string): WeaponBulk {
		const wb = new WeaponBulk().toObject()
		s = s.replaceAll(" ", "").replaceAll(",", "")
		wb.retractingStock = s.includes("*")
		const parts = s.split("/")
		;[wb.normal] = Int.extract(parts[0])
		if (parts.length > 1) {
			;[wb.giant] = Int.extract(parts[1])
		}
		return new WeaponBulk(wb)
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
	override tooltip(w: AbstractWeaponTemplate): string {
		if (!w.isOfType(ItemType.WeaponRanged)) return ""

		if (!this.retractingStock) return ""
		if (this.normal < 0) this.normal += 1
		if (this.giant < 0) this.giant += 1

		const accuracy = w.accuracy.resolve(w, null)
		accuracy.updateSource({ base: accuracy.base - 1 })
		const recoil = w.recoil.resolve(w, null)
		if (recoil.shot > 1) recoil.updateSource({ shot: recoil.shot + 1 })
		if (recoil.slug > 1) recoil.slug += 1
		recoil.updateSource({ slug: recoil.slug + 1 })
		const minST = w.strength.resolve(w, null)
		minST.updateSource({ min: Math.ceil(minST.min * 1.2) })

		return LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Tooltip.RetractingStock, {
			bulk: this.toString(),
			accuracy: accuracy.toString(),
			recoil: recoil.toString(),
			strength: minST.toString(),
		})
	}

	override resolve(w: AbstractWeaponTemplate, tooltip: TooltipGURPS): WeaponBulk {
		const result = this.toObject()
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
			result.normal = Math.trunc((result.normal * percent) / 100)
			result.giant = Math.trunc((result.giant * percent) / 100)
		}
		return new WeaponBulk(result)
	}
}

interface WeaponBulk
	extends WeaponField<AbstractWeaponTemplate, WeaponBulkSchema>,
		ModelPropsFromSchema<WeaponBulkSchema> {}

type WeaponBulkSchema = {
	normal: ToggleableNumberField<number, number, true, false, true>
	giant: ToggleableNumberField<number, number, true, false, true>
	retractingStock: ToggleableBooleanField<boolean, boolean, true, false, true>
}

export { WeaponBulk, type WeaponBulkSchema }
