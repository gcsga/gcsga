import fields = foundry.data.fields
import { ActorType, ItemType, gid } from "../constants.ts"
import { LocalizeGURPS, TooltipGURPS, difficulty } from "@util"
import { SpellTemplate, SpellTemplateSchema } from "./templates/spell.ts"
import { SkillLevel, calculateTechniqueLevel } from "./helpers.ts"
import { SkillDefault } from "./components/skill-default.ts"
import { Nameable } from "@module/util/index.ts"
import { AttributeDifficultyField } from "./fields/attribute-difficulty-field.ts"

class RitualMagicSpellData extends SpellTemplate {
	static override weaponTypes = new Set([ItemType.WeaponMelee, ItemType.WeaponRanged])

	override async getSheetData(context: Record<string, unknown>): Promise<void> {
		context.detailsParts = ["gurps.details-ritual-magic-spell", "gurps.details-prereqs"]
		context.embedsParts = ["gurps.embeds-weapon-melee", "gurps.embeds-weapon-ranged"]
	}

	static override defineSchema(): RitualMagicSpellSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			difficulty: new AttributeDifficultyField({
				initial: {
					attribute: "",
					difficulty: difficulty.Level.Average,
				},
				attributeChoices: { "": "" },
				difficultyChoices: difficulty.LevelsChoices("GURPS.AttributeDifficulty.AttributeKey", [
					difficulty.Level.Easy,
					difficulty.Level.VeryHard,
					difficulty.Level.Wildcard,
				]),
				label: "GURPS.Item.Spell.FIELDS.Difficulty.Name",
			}),
			base_skill: new fields.StringField<string, string, true, false, true>({
				required: true,
				nullable: false,
				initial: "Ritual Magic",
				label: "GURPS.Item.RitualMagicSpell.FIELDS.BaseSkill.Name",
			}),
			prereq_count: new fields.NumberField<number, number, true, false, true>({
				required: true,
				nullable: false,
				initial: 0,
				label: "GURPS.Item.RitualMagicSpell.FIELDS.PrereqCount.Name",
			}),
		}
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

	/** Nameables */
	override fillWithNameableKeys(
		m: Map<string, string>,
		existing: Map<string, string> = this.nameableReplacements,
	): void {
		super.fillWithNameableKeys(m, existing)
		Nameable.extract(this.base_skill, m, existing)
	}

	/**  Replacements */
	get skillNameWithReplacements(): string {
		return Nameable.apply(this.power_source, this.nameableReplacements)
	}
}

interface RitualMagicSpellData extends ModelPropsFromSchema<RitualMagicSpellSchema> {}

type RitualMagicSpellSchema = SpellTemplateSchema & {
	base_skill: fields.StringField<string, string, true, false, true>
	prereq_count: fields.NumberField<number, number, true, false, true>
}

export { RitualMagicSpellData, type RitualMagicSpellSchema }
