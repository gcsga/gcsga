import fields = foundry.data.fields
import { ActorType, ItemType, gid } from "../constants.ts"
import { LocalizeGURPS, StringBuilder, TooltipGURPS, difficulty } from "@util"
import { AbstractSkillTemplate, AbstractSkillTemplateSchema } from "./templates/abstract-skill.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { ContainerTemplate, ContainerTemplateSchema } from "./templates/container.ts"
import { PrereqTemplate, PrereqTemplateSchema } from "./templates/prereqs.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import { StudyTemplate, StudyTemplateSchema } from "./templates/study.ts"
import { ItemDataModel } from "../abstract.ts"
import { SpellFieldsTemplate, SpellFieldsTemplateSchema } from "./templates/spell-fields.ts"
import { ActorTemplateType } from "../actor/types.ts"
import { SkillLevel, calculateTechniqueLevel } from "./helpers.ts"
import { AttributeDifficulty } from "./compontents/attribute-difficulty.ts"
import { SkillDefault } from "../skill-default.ts"
import { Study } from "../study.ts"
import { Nameable } from "@module/util/index.ts"

class RitualMagicSpellData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	PrereqTemplate,
	ContainerTemplate,
	StudyTemplate,
	ReplacementTemplate,
	AbstractSkillTemplate,
	SpellFieldsTemplate,
) {
	static override weaponTypes = new Set([ItemType.WeaponMelee, ItemType.WeaponRanged])

	static override defineSchema(): RitualMagicSpellSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			difficulty: new fields.SchemaField(AttributeDifficulty.defineSchema(), {
				initial: {
					// TODO: review
					attribute: "",
					difficulty: difficulty.Level.Hard,
				},
			}),
			base_skill: new fields.StringField<string, string, true, false, true>({
				required: true,
				nullable: false,
				initial: "Ritual Magic",
			}),
			prereq_count: new fields.NumberField<number, number, true, false, true>({
				required: true,
				nullable: false,
				initial: 0,
			}),
		}) as RitualMagicSpellSchema
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
		const name = this.nameWithReplacements
		const powerSource = this.powerSourceWithReplacements
		const skillName = this.skillNameWithReplacements
		const prereqCount = this.prereq_count
		const tags = this.tags
		const difficulty = this.difficulty.difficulty
		const points = this.adjustedPoints(null)

		let skillLevel: SkillLevel = { level: Number.MIN_SAFE_INTEGER, relativeLevel: 0, tooltip: "" }
		if (this.college.length === 0) {
			skillLevel = this._determineLevelForCollege(name, "", skillName, prereqCount, tags, difficulty, points)
		} else {
			for (const college of this.college) {
				const possible = this._determineLevelForCollege(
					name,
					college,
					skillName,
					prereqCount,
					tags,
					difficulty,
					points,
				)
				if (skillLevel.level < possible.level) skillLevel = possible
			}
		}

		if (this.actor?.isOfType(ActorType.Character)) {
			const tooltip = new TooltipGURPS()
			tooltip.push(skillLevel.tooltip)
			const bonus = Math.trunc(
				this.actor.system.spellBonusFor(name, powerSource, this.collegeWithReplacements, tags, tooltip),
			)
			skillLevel.level += bonus
			skillLevel.relativeLevel += bonus
			skillLevel.tooltip = tooltip.toString()
		}
		return skillLevel
	}

	private _determineLevelForCollege(
		name: string,
		college: string,
		skillName: string,
		prereqCount: number,
		tags: string[],
		difficulty: difficulty.Level,
		points: number,
	): SkillLevel {
		const def = new SkillDefault({
			type: gid.Skill,
			name: skillName,
			specialization: college,
			modifier: -prereqCount,
		})
		if (college !== "") def.name = ""
		const limit = 0
		const skilllevel = calculateTechniqueLevel(
			this.actor,
			new Map(),
			name,
			college,
			tags,
			def,
			difficulty,
			points,
			false,
			limit,
		)
		skilllevel.relativeLevel = def.modifier
		def.specialization = ""
		def.modifier -= 6
		const fallback = calculateTechniqueLevel(
			this.actor,
			new Map(),
			name,
			college,
			tags,
			def,
			difficulty,
			points,
			false,
			limit,
		)
		fallback.relativeLevel += def.modifier
		if (skilllevel.level >= fallback.level) return skilllevel
		return fallback
	}

	satisfied(tooltip: TooltipGURPS | null = null): boolean {
		const actor = this.actor
		if (!actor?.isOfType(ActorType.Character)) {
			return true
		}
		const colleges = this.collegeWithReplacements
		if (colleges.length === 0) {
			if (tooltip !== null) {
				tooltip.push(LocalizeGURPS.translations.GURPS.Tooltip.Prefix)
				tooltip.push(LocalizeGURPS.translations.GURPS.Prereq.RitualMagic.College)
			}
			return false
		}
		for (const college of colleges) {
			if (actor.system.bestSkillNamed(this.skillNameWithReplacements, college, false) !== null) return true
		}
		if (actor.system.bestSkillNamed(this.skillNameWithReplacements, "", false) !== null) return true
		if (tooltip !== null) {
			tooltip.push(LocalizeGURPS.translations.GURPS.Tooltip.Prefix)
			const name = this.skillNameWithReplacements
			let buffer = LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Prereq.RitualMagic.SkillFirst, {
				name,
				specialization: colleges[0],
			})
			for (const [index, college] of colleges.entries()) {
				if (index === 0) continue
				buffer = LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Prereq.RitualMagic.SkillOr, {
					existing: buffer,
					name,
					specialization: college,
				})
			}
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Prereq.RitualMagic.Skill, { name: buffer }),
			)
		}
		return false
	}

	/**  Replacements */
	get skillNameWithReplacements(): string {
		return Nameable.apply(this.power_source, this.nameableReplacements)
	}
}

interface RitualMagicSpellData extends Omit<ModelPropsFromSchema<RitualMagicSpellSchema>, "study" | "difficulty"> {
	study: Study[]
	difficulty: AttributeDifficulty
}

type RitualMagicSpellSchema = BasicInformationTemplateSchema &
	PrereqTemplateSchema &
	ContainerTemplateSchema &
	StudyTemplateSchema &
	ReplacementTemplateSchema &
	AbstractSkillTemplateSchema &
	SpellFieldsTemplateSchema & {
		base_skill: fields.StringField<string, string, true, false, true>
		prereq_count: fields.NumberField<number, number, true, false, true>
	}

export { RitualMagicSpellData, type RitualMagicSpellSchema }
