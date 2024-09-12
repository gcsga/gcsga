import fields = foundry.data.fields
import { WeaponField } from "./weapon-field.ts"
import { Int, StringBuilder, TooltipGURPS, feature } from "@util"
import * as weaponRangedTs from "../weapon-ranged.ts"

class WeaponRecoil extends WeaponField<weaponRangedTs.WeaponRangedData, WeaponRecoilSchema> {
	static override defineSchema(): WeaponRecoilSchema {
		const fields = foundry.data.fields
		return {
			shot: new fields.NumberField<number, number, true, false, true>({
				required: true,
				nullable: false,
				initial: 0,
			}),
			slug: new fields.NumberField<number, number, true, false, true>({
				required: true,
				nullable: false,
				initial: 0,
			}),
		}
	}

	static override fromString(s: string): WeaponRecoil {
		const wr = new WeaponRecoil({})
		s = s.replaceAll(" ", "").replaceAll(",", "")
		const parts = s.split("/")
		;[wr.shot] = Int.extract(parts[0])
		if (parts.length > 1) {
			;[wr.slug] = Int.extract(parts[1])
		}
		return wr
	}

	override toString(): string {
		if (this.shot === 0 && this.slug === 0) return ""
		const buffer = new StringBuilder()
		buffer.push(this.shot.toString())
		if (this.slug !== 0) buffer.push("/", this.slug.toString())
		return buffer.toString()
	}

	override resolveValue(w: weaponRangedTs.WeaponRangedData, tooltip: TooltipGURPS): WeaponRecoil {
		const result = this.clone()
		if (this.shot > 0 || this.slug > 0) {
			let percent = 0
			for (const bonus of w.collectWeaponBonuses(1, tooltip, feature.Type.WeaponRecoilBonus)) {
				const amt = bonus.adjustedAmountForWeapon(w)
				if (bonus.percent) percent += amt
				else {
					result.shot += amt
					result.slug += amt
				}
			}
			if (percent !== 0) {
				result.shot += Math.trunc((result.shot * percent) / 100)
				result.slug += Math.trunc((result.slug * percent) / 100)
			}
			if (this.shot > 0) result.shot = Math.max(result.shot, 1)
			else result.shot = 0

			if (this.slug > 0) result.slug = Math.max(result.slug, 1)
			else result.slug = 0
		}
		result.clean()
		return result
	}

	override clean(): void {
		this.shot = Math.max(this.shot, 0)
		this.slug = Math.max(this.slug, 0)
	}
}

interface WeaponRecoil
	extends WeaponField<weaponRangedTs.WeaponRangedData, WeaponRecoilSchema>,
		ModelPropsFromSchema<WeaponRecoilSchema> {}

type WeaponRecoilSchema = {
	shot: fields.NumberField<number, number, true, false, true>
	slug: fields.NumberField<number, number, true, false, true>
}

export { WeaponRecoil, type WeaponRecoilSchema }