import { ItemDataModel } from "@module/data/item/abstract.ts"
import fields = foundry.data.fields
import { difficulty, Int, LocalizeGURPS, StringBuilder } from "@util"
import { ItemType } from "@module/data/constants.ts"
import { SkillLevel } from "../helpers.ts"
import { ItemTemplateType } from "../types.ts"
import { ActorTemplateType } from "@module/data/actor/types.ts"
import { AttributeDifficulty } from "../components/attribute-difficulty.ts"
import { Nameable } from "@module/util/index.ts"
import { AttributeDifficultyField } from "../fields/attribute-difficulty-field.ts"

class AbstractSkillTemplate extends ItemDataModel<AbstractSkillTemplateSchema> {
	protected declare _skillLevel: SkillLevel

	static override defineSchema(): AbstractSkillTemplateSchema {
		const fields = foundry.data.fields
		return {
			difficulty: new AttributeDifficultyField(),
			tech_level: new fields.StringField({
				required: true,
				nullable: true,
				initial: null,
				label: "GURPS.Item.Skill.FIELDS.TechLevel.Name",
			}),
			tech_level_required: new fields.BooleanField({
				required: true,
				nullable: false,
				initial: false,
				label: "GURPS.Item.Skill.FIELDS.TechLevelRequired.Name",
			}),
			points: new fields.NumberField({
				required: true,
				nullable: false,
				integer: true,
				min: 0,
				initial: 0,
				label: "GURPS.Item.Skill.FIELDS.Points.Name",
			}),
		}
	}
	static override _cleanData(
		source?: DeepPartial<SourceFromSchema<AbstractSkillTemplateSchema>> & { [key: string]: unknown },
		_options?: Record<string, unknown>,
	): void {
		if (source && Object.hasOwn(source, "tech_level_required")) {
			source.tech_level = source.tech_level_required ? source.tech_level || "" : null
		}
	}

	get processedName(): string {
		const buffer = new StringBuilder()
		buffer.push(this.hasTemplate(ItemTemplateType.BasicInformation) ? this.nameWithReplacements : "")
		if (this.tech_level_required) {
			buffer.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.TechLevelShort, { level: this.tech_level }),
			)
		}
		if (this.isOfType(ItemType.Skill) && this.specializationWithReplacements !== "") {
			buffer.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.SkillSpecialization, {
					specialization: this.specializationWithReplacements,
				}),
			)
		}
		return buffer.toString()
	}

	get level(): SkillLevel {
		return (this._skillLevel ??= this.calculateLevel())
	}

	// Level as number or "-"
	get levelAsString(): string {
		const level = Math.trunc(this.level.level)
		if (level <= 0) return "-"
		return level.toString()
	}

	// Relative level in the format e.g "DX+1"
	get relativeLevel(): string {
		if (this.level.level <= 0) return ""
		const rsl = this.adjustedRelativeLevel
		switch (true) {
			case rsl === Number.MIN_SAFE_INTEGER:
				return "-"
			case this.parent.type === ItemType.Technique:
				return rsl.signedString()
			default: {
				const actor = this.actor
				if (!actor?.hasTemplate(ActorTemplateType.Attributes)) {
					console.error("Error resolving relative level: Actor is not an attriubte holder.")
					return "-"
				}
				return actor.system.resolveAttributeName(this.difficulty.attribute) + Int.stringWithSign(rsl)
			}
		}
	}

	get adjustedRelativeLevel(): number {
		if (this.actor !== null && this.level.level > 0) {
			if (this.isOfType(ItemType.Technique)) {
				return this.level.relativeLevel + this.default.modifier
			}
			return this.level.relativeLevel
		}
		return Number.MIN_SAFE_INTEGER
	}

	updateLevel(): boolean {
		const saved = this.level
		if (this.isOfType(ItemType.Skill)) this.defaulted_from = this.bestDefaultWithPoints(null)
		this._skillLevel = this.calculateLevel()
		return saved.level !== this.level.level
	}

	calculateLevel(_excludes: Set<string> = new Set()): SkillLevel {
		return (this._skillLevel ??= { level: 0, relativeLevel: 0, tooltip: "" })
	}

	adjustedPoints(..._args: unknown[]): number {
		return this.points
	}

	setLevel(level: number): DeepPartial<this["_source"]> {
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

	incrementLevel(): void {
		const basePoints = this.points + 1
		let maxPoints = basePoints

		if (this.difficulty.difficulty === difficulty.Level.Wildcard) maxPoints += 12
		else maxPoints += 4

		const oldLevel = this._skillLevel.level
		for (let points = basePoints; points < maxPoints; points++) {
			this.points = points
			if (this.calculateLevel().level > oldLevel) {
				this.updateSource({ points: points })
			}
		}
	}

	/**  Replacements */
	get specializationWithReplacements(): string {
		if (this.isOfType(ItemType.Skill)) return Nameable.apply(this.specialization, this.nameableReplacements)
		return ""
	}
}

interface AbstractSkillTemplate
	extends ItemDataModel<AbstractSkillTemplateSchema>,
		Omit<ModelPropsFromSchema<AbstractSkillTemplateSchema>, "difficulty"> {
	constructor: typeof AbstractSkillTemplate
	difficulty: AttributeDifficulty
}

type AbstractSkillTemplateSchema = {
	difficulty: AttributeDifficultyField
	tech_level: fields.StringField<string, string, true, true, true>
	tech_level_required: fields.BooleanField<boolean, boolean, true, false, true>
	points: fields.NumberField<number, number, true, false, true>
}
export { AbstractSkillTemplate, type AbstractSkillTemplateSchema }
