import { ItemDataModel, ItemDataSchema } from "@module/data/abstract.ts"
import fields = foundry.data.fields
import { SkillLevel } from "@item/skill/data.ts"
import { difficulty, TooltipGURPS } from "@util"
import { ItemType } from "@module/data/constants.ts"

class AbstractSkillTemplate extends ItemDataModel<AbstractSkillTemplateSchema> {
	private declare _skillLevel: SkillLevel

	static override defineSchema(): AbstractSkillTemplateSchema {
		const fields = foundry.data.fields
		return {
			...super.defineSchema(),
			tech_level: new fields.StringField({ required: true, nullable: true, initial: null }),
			tech_level_required: new fields.BooleanField({ required: true, nullable: false, initial: false }),
			points: new fields.NumberField({ integer: true, min: 0 }),
		}
	}

	calculateLevel(): SkillLevel {
		return (this._skillLevel ??= { level: 0, relativeLevel: 0, tooltip: new TooltipGURPS() })
	}

	adjustedPoints(_tooltip?: TooltipGURPS): number {
		return this.points
	}

	setLevel(level: number) {
		return this.updateSource({ points: this.getPointsForLevel(level) })
	}

	getPointsForLevel(level: number): number {
		const basePoints = this.points
		const oldLevel = this._skillLevel.level
		if (oldLevel > level) {
			for (let points = basePoints; points > 0; points--) {
				this.points = points
				if (this.calculateLevel().level === level) {
					return points
				}
			}
			return 0
		} else {
			// HACK: capped at 100 points, probably not a good idea
			for (let points = basePoints; points < 100; points++) {
				this.points = points
				if (this.calculateLevel().level === level) {
					return points
				}
			}
			return 100
		}
	}

	incrementLevel() {
		const basePoints = this.points + 1
		let maxPoints = basePoints

		let diff = difficulty.Level.Average

		if (this.isOfType(ItemType.Skill, ItemType.Spell)) diff = this.difficulty.difficulty
		else if (this.isOfType(ItemType.Technique, ItemType.RitualMagicSpell)) diff = this.difficulty

		if (diff === difficulty.Level.Wildcard) maxPoints += 12
		else maxPoints += 4

		const oldLevel = this._skillLevel.level
		for (let points = basePoints; points < maxPoints; points++) {
			this.points = points
			if (this.calculateLevel().level > oldLevel) {
				this.updateSource({ points: points })
			}
		}
	}
}

interface AbstractSkillTemplate
	extends ItemDataModel<AbstractSkillTemplateSchema>,
		ModelPropsFromSchema<AbstractSkillTemplateSchema> {
	constructor: typeof AbstractSkillTemplate
}

type AbstractSkillTemplateSchema = ItemDataSchema & {
	tech_level: fields.StringField<string, string, true, true, true>
	tech_level_required: fields.BooleanField<boolean, boolean, true, false, true>
	points: fields.NumberField<number, number, true, false>
}

export { AbstractSkillTemplate, type AbstractSkillTemplateSchema }
