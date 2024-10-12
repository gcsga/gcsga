import { ActorType, ItemType, gid } from "../constants.ts"
import { TooltipGURPS, difficulty } from "@util"
import { SkillLevel } from "./helpers.ts"
import { AttributeDifficultyField } from "./fields/attribute-difficulty-field.ts"
import { getAttributeChoices } from "../attribute/helpers.ts"
import { SpellTemplate, SpellTemplateSchema } from "./templates/spell.ts"

class SpellData extends SpellTemplate {
	static override weaponTypes = new Set([ItemType.WeaponMelee, ItemType.WeaponRanged])

	override async getSheetData(context: Record<string, unknown>): Promise<void> {
		context.detailsParts = ["gurps.details-spell", "gurps.details-prereqs"]
		context.embedsParts = ["gurps.embeds-weapons-melee", "gurps.embeds-weapons-ranged"]
	}

	static override defineSchema(): SpellSchema {
		return {
			...super.defineSchema(),
			difficulty: new AttributeDifficultyField({
				initial: {
					attribute: gid.Intelligence,
					difficulty: difficulty.Level.Hard,
				},
				attributeChoices: getAttributeChoices(null, gid.Dexterity, "GURPS.AttributeDifficulty.AttributeKey", {
					blank: false,
					ten: true,
					size: false,
					dodge: false,
					parry: false,
					block: false,
					skill: false,
				}).choices,
				label: "GURPS.Item.Spell.FIELDS.Difficulty.Name",
			}),
		}
	}

	override calculateLevel(): SkillLevel {
		const tooltip = new TooltipGURPS()
		let relativeLevel = difficulty.Level.baseRelativeLevel(this.difficulty.difficulty)
		let level = Number.MIN_SAFE_INTEGER
		if (this.actor?.isOfType(ActorType.Character)) {
			let points = Math.trunc(this.adjustedPoints())
			level = this.actor.system.resolveAttributeCurrent(this.difficulty.attribute)
			if (this.difficulty.attribute === difficulty.Level.Wildcard) {
				points = Math.trunc(points / 3)
			}
			switch (true) {
				case points < 1:
					level = Number.MIN_SAFE_INTEGER
					relativeLevel = 0
					break
				case points === 1:
					break
				case points < 4:
					relativeLevel += 1
					break
				default:
					relativeLevel += 1 + Math.trunc(points / 4)
			}
			if (level !== Number.MIN_SAFE_INTEGER) {
				relativeLevel += this.actor.system.spellBonusFor(
					this.nameWithReplacements,
					this.powerSourceWithReplacements,
					this.collegeWithReplacements,
					this.tags,
					tooltip,
				)
				relativeLevel = Math.trunc(relativeLevel)
				level += relativeLevel
			}
		}
		return {
			level,
			relativeLevel,
			tooltip: tooltip.toString(),
		}
	}
}

interface SpellData extends ModelPropsFromSchema<SpellSchema> {}

type SpellSchema = SpellTemplateSchema
export { SpellData, type SpellSchema }
