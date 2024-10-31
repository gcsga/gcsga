import { WeaponField } from "./weapon-field.ts"
import fields = foundry.data.fields
import { AbstractWeaponTemplate } from "../templates/abstract-weapon.ts"
import { Int, StringBuilder, TooltipGURPS, feature, wswitch } from "@util"
import { ActorType, gid } from "@module/data/constants.ts"
import { ToggleableBooleanField, ToggleableNumberField } from "@module/data/fields/index.ts"

class WeaponBlock extends WeaponField<AbstractWeaponTemplate, WeaponBlockSchema> {
	static override defineSchema(): WeaponBlockSchema {
		return {
			canBlock: new ToggleableBooleanField({ required: true, nullable: false, initial: false }),
			modifier: new ToggleableNumberField({
				required: true,
				nullable: false,
				initial: 0,
			}),
		}
	}

	static override fromString(s: string): WeaponBlock {
		const wp = new WeaponBlock().toObject()
		s = s.trim().toLowerCase()

		if (s !== "" && s !== "-" && s !== "–" && !s.includes("no")) {
			wp.canBlock = true
			;[wp.modifier] = Int.extract(s)
		}
		return new WeaponBlock(wp)
	}

	override toString(): string {
		if (!this.canBlock) return "No"
		const buffer = new StringBuilder()
		buffer.push(this.modifier.toString())
		return buffer.toString()
	}

	override resolve(w: AbstractWeaponTemplate, tooltip: TooltipGURPS | null): WeaponBlock {
		const result = this.toObject()
		result.canBlock = w.resolveBoolFlag(wswitch.Type.CanBlock, result.canBlock)
		if (result.canBlock) {
			const actor = this.parent.actor
			if (actor?.isOfType(ActorType.Character)) {
				const primaryTooltip = new TooltipGURPS()
				const preAdj = w.skillLevelBaseAdjustment(actor, primaryTooltip)
				const postAdj = w.skillLevelPostAdjustment(actor, primaryTooltip)
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
		return new WeaponBlock(result)
	}

	static override cleanData(
		source?: object | undefined,
		options?: Record<string, unknown> | undefined,
	): SourceFromSchema<fields.DataSchema> {
		let { modifier, canBlock }: Partial<SourceFromSchema<WeaponBlockSchema>> = {
			modifier: 0,
			canBlock: false,
			...source,
		}

		if (!canBlock) modifier = 0

		return super.cleanData({ ...source, modifier, canBlock }, options)
	}
}

interface WeaponBlock
	extends WeaponField<AbstractWeaponTemplate, WeaponBlockSchema>,
		ModelPropsFromSchema<WeaponBlockSchema> {}

type WeaponBlockSchema = {
	canBlock: ToggleableBooleanField<boolean, boolean, true, false, true>
	modifier: ToggleableNumberField<number, number, true, false, true>
}

export { WeaponBlock, type WeaponBlockSchema }
