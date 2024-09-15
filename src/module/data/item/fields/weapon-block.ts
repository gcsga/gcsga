import { WeaponField } from "./weapon-field.ts"
import fields = foundry.data.fields
import { AbstractWeaponTemplate } from "../templates/abstract-weapon.ts"
import { Int, StringBuilder, TooltipGURPS, feature, wswitch } from "@util"
import { ActorType, gid } from "@module/data/constants.ts"

class WeaponBlock extends WeaponField<AbstractWeaponTemplate, WeaponBlockSchema> {
	static override defineSchema(): WeaponBlockSchema {
		const fields = foundry.data.fields
		return {
			canBlock: new fields.BooleanField<boolean>({ required: true, nullable: false, initial: false }),
			modifier: new fields.NumberField<number, number, true, false, true>({
				required: true,
				nullable: false,
				initial: 0,
			}),
		}
	}

	static override fromString(s: string): WeaponBlock {
		const wp = new WeaponBlock({})
		s = s.trim().toLowerCase()

		if (s !== "" && s !== "-" && s !== "–" && !s.includes("no")) {
			wp.canBlock = true
			;[wp.modifier] = Int.extract(s)
			wp.clean()
		}
		return wp
	}

	override toString(): string {
		if (!this.canBlock) return "No"
		const buffer = new StringBuilder()
		buffer.push(this.modifier.toString())
		return buffer.toString()
	}

	override resolve(w: AbstractWeaponTemplate, tooltip: TooltipGURPS | null): WeaponBlock {
		const result = this.clone()
		result.canBlock = w.resolveBoolFlag(wswitch.Type.CanBlock, result.canBlock)
		if (result.canBlock) {
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
					if (def.type !== gid.Block) level = Math.trunc(level / 2)
					level += postAdj
					if (best < level) best = level
				}
				if (best !== Number.MIN_SAFE_INTEGER) {
					tooltip?.appendToNewLine(primaryTooltip.toString())
					result.modifier += 3 + best + actor.system.bonuses.block.value
					tooltip?.appendToNewLine(actor.system.bonuses.block.tooltip)
					let percentModifier = 0
					for (const bonus of w.collectWeaponBonuses(1, tooltip, feature.Type.WeaponBlockBonus)) {
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
		if (!this.canBlock) this.modifier = 0
	}
}

interface WeaponBlock
	extends WeaponField<AbstractWeaponTemplate, WeaponBlockSchema>,
		ModelPropsFromSchema<WeaponBlockSchema> {}

type WeaponBlockSchema = {
	canBlock: fields.BooleanField<boolean, boolean, true, false, true>
	modifier: fields.NumberField<number, number, true, false, true>
}

export { WeaponBlock, type WeaponBlockSchema }
