import { ItemDataModel } from "../abstract.ts"
import { ActorType, ItemType, gid } from "../constants.ts"
import { AttributeDifficulty } from "./compontents/attribute-difficulty.ts"
import { LocalizeGURPS, StringBuilder, TooltipGURPS, difficulty } from "@util"
import {
	AbstractSkillTemplate,
	AbstractSkillTemplateSchema,
	BasicInformationTemplate,
	BasicInformationTemplateSchema,
	ContainerTemplate,
	ContainerTemplateSchema,
	PrereqTemplate,
	PrereqTemplateSchema,
	ReplacementTemplate,
	ReplacementTemplateSchema,
	SpellFieldsTemplate,
	SpellFieldsTemplateSchema,
	StudyTemplate,
	StudyTemplateSchema,
} from "./templates/index.ts"
import { ActorTemplateType } from "../actor/types.ts"
import { SkillLevel } from "./helpers.ts"
import { Study } from "../study.ts"
import { AttributeDifficultyField } from "./fields/attribute-difficulty-field.ts"
import { getAttributeChoices } from "../attribute/helpers.ts"

class SpellData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	PrereqTemplate,
	ContainerTemplate,
	StudyTemplate,
	ReplacementTemplate,
	AbstractSkillTemplate,
	SpellFieldsTemplate,
) {
	static override weaponTypes = new Set([ItemType.WeaponMelee, ItemType.WeaponRanged])

	static override defineSchema(): SpellSchema {
		return this.mergeSchema(super.defineSchema(), {
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
		}) as SpellSchema
	}

	override get processedName(): string {
		const buffer = new StringBuilder()
		buffer.push(this.nameWithReplacements)
		if (this.tech_level_required)
			buffer.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.TechLevelShort, { level: this.tech_level }),
			)
		return buffer.toString()
	}

	override adjustedPoints(tooltip: TooltipGURPS | null = null, temporary = false): number {
		let points = this.points
		if (this.actor?.hasTemplate(ActorTemplateType.Features)) {
			points += this.actor.system.spellPointBonusFor(
				this.nameWithReplacements,
				this.powerSourceWithReplacements,
				this.collegeWithReplacements,
				this.tags,
				tooltip,
				temporary,
			)
			points = Math.max(points, 0)
		}
		return points
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

interface SpellData extends Omit<ModelPropsFromSchema<SpellSchema>, "study" | "difficulty"> {
	study: Study[]
	difficulty: AttributeDifficulty
}

type SpellSchema = BasicInformationTemplateSchema &
	PrereqTemplateSchema &
	ContainerTemplateSchema &
	StudyTemplateSchema &
	ReplacementTemplateSchema &
	AbstractSkillTemplateSchema &
	SpellFieldsTemplateSchema & {}

export { SpellData, type SpellSchema }
