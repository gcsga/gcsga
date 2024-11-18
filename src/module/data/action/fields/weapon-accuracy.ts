import fields = foundry.data.fields
import { WeaponField } from "./weapon-field.ts"
import { Int, TooltipGURPS, feature, wswitch } from "@util"
import { ActorTemplateType } from "@module/data/actor/types.ts"
import { ToggleableBooleanField, ToggleableNumberField } from "@module/data/fields/index.ts"
import { BaseAttack } from "../base-attack.ts"

class WeaponAccuracy extends WeaponField<BaseAttack, WeaponAccuracySchema> {
	static override defineSchema(): WeaponAccuracySchema {
		return {
			base: new ToggleableNumberField({
				required: true,
				nullable: false,
				initial: 0,
			}),
			scope: new ToggleableNumberField({
				required: true,
				nullable: false,
				initial: 0,
			}),
			jet: new ToggleableBooleanField({ required: true, nullable: false, initial: false }),
		}
	}

	static override fromString(s: string): WeaponAccuracy {
		const wa = new WeaponAccuracy().toObject()
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
		return new WeaponAccuracy(wa)
	}

	override toString(): string {
		if (this.jet) return "Jet"
		if (this.scope !== 0) return this.base.toString() + this.scope.signedString()
		return this.base.toString()
	}

	override resolve(w: BaseAttack, tooltip: TooltipGURPS | null): WeaponAccuracy {
		const result = this.toObject()
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
		return new WeaponAccuracy(result)
	}

	override tooltip(_w: BaseAttack): string {
		return ""
	}

	static override cleanData(
		source?: object | undefined,
		options?: Record<string, unknown> | undefined,
	): SourceFromSchema<fields.DataSchema> {
		let { jet, base, scope }: Partial<SourceFromSchema<WeaponAccuracySchema>> = {
			jet: false,
			base: 0,
			scope: 0,
			...source,
		}

		if (jet) {
			base = 0
			scope = 0
			return super.cleanData({ ...source, jet, base, scope }, options)
		}
		base = Math.max(base, 0)
		scope = Math.max(scope, 0)
		return super.cleanData({ ...source, jet, base, scope }, options)
	}
}

interface WeaponAccuracy
	extends WeaponField<BaseAttack, WeaponAccuracySchema>,
		ModelPropsFromSchema<WeaponAccuracySchema> {}

type WeaponAccuracySchema = {
	base: ToggleableNumberField<number, number, true, false, true>
	scope: ToggleableNumberField<number, number, true, false, true>
	jet: ToggleableBooleanField<boolean, boolean, true, false, true>
}

export { WeaponAccuracy, type WeaponAccuracySchema }
