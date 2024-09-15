import { WeaponField } from "./weapon-field.ts"
import fields = foundry.data.fields
import { AbstractWeaponTemplate } from "../templates/abstract-weapon.ts"
import { Int, LocalizeGURPS, StringBuilder, TooltipGURPS, feature, wswitch } from "@util"
import { ActorType, gid } from "@module/data/constants.ts"

class WeaponParry extends WeaponField<AbstractWeaponTemplate, WeaponParrySchema> {
	static override defineSchema(): WeaponParrySchema {
		const fields = foundry.data.fields
		return {
			canParry: new fields.BooleanField<boolean>({ required: true, nullable: false, initial: false }),
			fencing: new fields.BooleanField<boolean>({ required: true, nullable: false, initial: false }),
			unbalanced: new fields.BooleanField<boolean>({ required: true, nullable: false, initial: false }),
			modifier: new fields.NumberField<number, number, true, false, true>({
				required: true,
				nullable: false,
				initial: 0,
			}),
		}
	}

	static override fromString(s: string): WeaponParry {
		const wp = new WeaponParry({})
		s = s.trim().toLowerCase()

		if (s !== "" && s !== "-" && s !== "–" && !s.includes("no")) {
			wp.canParry = true
			wp.fencing = s.includes("f")
			wp.unbalanced = s.includes("u")
			;[wp.modifier] = Int.extract(s)
			wp.clean()
		}
		return wp
	}

	override toString(): string {
		if (!this.canParry) return "No"
		const buffer = new StringBuilder()
		buffer.push(this.modifier.toString())
		if (this.fencing) buffer.push("F")
		if (this.unbalanced) buffer.push("U")
		return buffer.toString()
	}

	override tooltip(_w: AbstractWeaponTemplate): string {
		if (!this.canParry || (!this.fencing && !this.unbalanced)) {
			return ""
		}
		const tooltip = new TooltipGURPS()
		if (this.fencing)
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Tooltip.ParryFencing, {
					retreatingParry: this.modifier + 3,
					normalParry: this.modifier + 1,
				}),
			)
		if (this.unbalanced) {
			if (tooltip.length !== 0) tooltip.push("\n\n")
			tooltip.push(LocalizeGURPS.translations.GURPS.Tooltip.ParryUnbalanced)
		}
		return tooltip.toString()
	}

	override resolve(w: AbstractWeaponTemplate, tooltip: TooltipGURPS | null): WeaponParry {
		const result = this.clone()
		result.canParry = w.resolveBoolFlag(wswitch.Type.CanParry, result.canParry)
		if (result.canParry) {
			result.fencing = w.resolveBoolFlag(wswitch.Type.Fencing, result.fencing)
			result.unbalanced = w.resolveBoolFlag(wswitch.Type.Unbalanced, result.unbalanced)

			const actor = this.parent.actor
			if (actor?.isOfType(ActorType.Character)) {
				const primaryTooltip = new TooltipGURPS()
				let preAdj = w.skillLevelBaseAdjustment(actor, primaryTooltip)
				let postAdj = w.skillLevelPostAdjustment(actor, primaryTooltip)
				let best = Number.MIN_SAFE_INTEGER
				for (const def of w.defaults) {
					let level = def.skillLevelFast(actor, w.nameableReplacements, false, new Set(), true)
					if (level === Number.MIN_SAFE_INTEGER) continue
					level += preAdj
					if (def.type !== gid.Parry) level = Math.trunc(level / 2)
					level += postAdj
					if (best < level) best = level
				}
				if (best !== Number.MIN_SAFE_INTEGER) {
					tooltip?.appendToNewLine(primaryTooltip.toString())
					result.modifier += 3 + best + actor.system.bonuses.parry.value
					tooltip?.appendToNewLine(actor.system.bonuses.parry.tooltip)
					let percentModifier = 0
					for (const bonus of w.collectWeaponBonuses(1, tooltip, feature.Type.WeaponParryBonus)) {
						const amt = bonus.adjustedAmountForWeapon(w)
						if (bonus.percent) percentModifier += amt
						else result.modifier += amt
					}
					if (percentModifier !== 0) result.modifier += Math.trunc((result.modifier * percentModifier) / 100)
					result.modifier = Math.trunc(Math.max(result.modifier, 0))
				} else {
					result.modifier = 0
				}
			}
		}
		result.clean()
		return result
	}

	override clean(): void {
		if (!this.canParry) {
			this.modifier = 0
			this.fencing = false
			this.unbalanced = false
		}
	}
}

interface WeaponParry
	extends WeaponField<AbstractWeaponTemplate, WeaponParrySchema>,
		ModelPropsFromSchema<WeaponParrySchema> {}

type WeaponParrySchema = {
	canParry: fields.BooleanField<boolean, boolean, true, false, true>
	fencing: fields.BooleanField<boolean, boolean, true, false, true>
	unbalanced: fields.BooleanField<boolean, boolean, true, false, true>
	modifier: fields.NumberField<number, number, true, false, true>
}

export { WeaponParry, type WeaponParrySchema }
