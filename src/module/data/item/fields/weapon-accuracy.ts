import fields = foundry.data.fields
import { WeaponField } from "./weapon-field.ts"
import { Int, TooltipGURPS, feature, wswitch } from "@util"
import { WeaponRangedData } from "../weapon-ranged.ts"
import { ActorTemplateType } from "@module/data/actor/types.ts"

class WeaponAccuracy extends WeaponField<WeaponRangedData, WeaponAccuracySchema> {
	static override defineSchema(): WeaponAccuracySchema {
		const fields = foundry.data.fields
		return {
			base: new fields.NumberField<number, number, true, false, true>({
				required: true,
				nullable: false,
				initial: 0,
			}),
			scope: new fields.NumberField<number, number, true, false, true>({
				required: true,
				nullable: false,
				initial: 0,
			}),
			jet: new fields.BooleanField<boolean>({ required: true, nullable: false, initial: false }),
		}
	}

	static override fromString(s: string): WeaponAccuracy {
		const wa = new WeaponAccuracy({})
		s = s.replaceAll(" ", "").toLowerCase()
		if (s.includes("jet")) wa.jet = true
		else {
			s = s.replaceAll(/^\++/, "")
			const parts = s.split("+")
			;[wa.base] = Int.extract(parts[0])
			if (parts.length > 1) {
				;[wa.scope] = Int.extract(parts[1])
			}
		}
		wa.clean()
		return wa
	}

	override toString(): string {
		if (this.jet) return "Jet"
		if (this.scope !== 0) return this.base.toString() + this.scope.signedString()
		return this.base.toString()
	}

	override resolveValue(w: WeaponRangedData, tooltip: TooltipGURPS): WeaponAccuracy {
		const result = this.clone()
		result.jet = w.resolveBoolFlag(wswitch.Type.Jet, result.jet)

		if (!result.jet) {
			const actor = w.actor
			if (actor !== null && actor.hasTemplate(ActorTemplateType.Features)) {
				let [percentBase, percentScope] = [0, 0]
				for (const bonus of w.collectWeaponBonuses(
					1,
					tooltip,
					feature.Type.WeaponAccBonus,
					feature.Type.WeaponScopeAccBonus,
				)) {
					const amt = bonus.adjustedAmountForWeapon(w)
					switch (bonus.type) {
						case feature.Type.WeaponAccBonus:
							if (bonus.percent) percentBase += amt
							else result.base += amt
							break
						case feature.Type.WeaponScopeAccBonus:
							if (bonus.percent) percentScope += amt
							else result.scope += amt
					}
				}

				if (percentBase !== 0) result.base += Math.trunc((result.base * percentBase) / 100)
				if (percentScope !== 0) result.scope += Math.trunc((result.scope * percentScope) / 100)
			}
		}
		result.clean()
		return result
	}

	override clean(): void {
		if (this.jet) {
			this.base = 0
			this.scope = 0
			return
		}
		this.base = Math.max(this.base, 0)
		this.scope = Math.max(this.scope, 0)
	}
}

interface WeaponAccuracy
	extends WeaponField<WeaponRangedData, WeaponAccuracySchema>,
		ModelPropsFromSchema<WeaponAccuracySchema> {}

type WeaponAccuracySchema = {
	base: fields.NumberField<number, number, true, false, true>
	scope: fields.NumberField<number, number, true, false, true>
	jet: fields.BooleanField<boolean, boolean, true, false, true>
}

export { WeaponAccuracy, type WeaponAccuracySchema }
