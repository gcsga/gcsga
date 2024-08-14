import { ActorGURPS } from "@actor"
import { AbstractSkillGURPS } from "@item"
import { TechniqueSource, TechniqueSystemData } from "./data.ts"
import { LocalizeGURPS, NewLineRegex, StringBuilder, TooltipGURPS, difficulty, display } from "@util"
import { SheetSettings, SkillDefault, resolveStudyHours, studyHoursProgressText } from "@system"
import { ActorType, gid } from "@module/data/constants.ts"
import { SkillLevel } from "@item/skill/data.ts"
import { Nameable } from "@module/util/nameable.ts"

class TechniqueGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractSkillGURPS<TParent> {
	declare default: SkillDefault

	override secondaryText(optionChecker: (option: display.Option) => boolean): string {
		const buffer = new StringBuilder()
		const settings = SheetSettings.for(this.actor)
		if (optionChecker(settings.modifiers_display)) {
			const text = this.modifierNotes
			if ((text?.trim() ?? "") !== "") buffer.push(text)
		}
		if (optionChecker(settings.notes_display)) {
			buffer.appendToNewLine(this.notes.trim())
			buffer.appendToNewLine(
				studyHoursProgressText(resolveStudyHours(this.system.study), this.system.study_hours_needed, false),
			)
		}
		if (optionChecker(settings.skill_level_adj_display)) {
			if (
				this.level.tooltip.length !== 0 &&
				!this.level.tooltip.includes(LocalizeGURPS.translations.gurps.common.no_additional_modifiers)
			) {
				let levelTooltip = this.level.tooltip.string.trim().replaceAll(NewLineRegex, ", ")
				const msg = LocalizeGURPS.translations.gurps.common.includes_modifiers_from
				if (levelTooltip.startsWith(`${msg},`)) levelTooltip = `${msg}:${levelTooltip.slice(msg.length + 1)}`
				buffer.appendToNewLine(levelTooltip)
			}
		}
		return buffer.toString()
	}

	get modifierNotes(): string {
		if (!this.actor || !this.default) return ""
		if (!this.actor.isOfType(ActorType.Character)) return ""
		return LocalizeGURPS.format(LocalizeGURPS.translations.gurps.item.default, {
			skill: this.default.fullName(this.actor),
			modifier: this.default.modifier.signedString(),
		})
	}

	override prepareBaseData(): void {
		super.prepareBaseData()
		this.default = new SkillDefault(this.system.default)
	}

	calculateLevel(): SkillLevel {
		const actor = this.dummyActor || this.actor
		const tooltip = new TooltipGURPS()
		const points = this.adjustedPoints()

		if (!(actor instanceof ActorGURPS) || !actor.isOfType(ActorType.Character)) {
			return { level: Number.MIN_SAFE_INTEGER, relativeLevel: Number.MIN_SAFE_INTEGER, tooltip: tooltip }
		}

		// Level of defaulting skill.
		const defaultSkillLevel = getDefaultSkillLevel(this)

		// Any modifiers to the default skill level based on conditions or other factors.
		const skillBonus = actor.skillBonusFor(this.name!, this.specialization, this.tags, tooltip)

		// The effective skill level is the base level plus the skill bonus.
		const effectiveSkillLevel = defaultSkillLevel + skillBonus

		// The base level of the technique (the default skill level plus the technique's modifier).
		const baseTechniqueLevel = this.default.modifier + effectiveSkillLevel

		// Bonus to the technique's base level.
		const relativeTechniqueLevel = getRelativeTechniqueLevel(this)

		let level = baseTechniqueLevel + relativeTechniqueLevel
		let relativeLevel = this.default.modifier + relativeTechniqueLevel
		if (this.system.limit) {
			const max = baseTechniqueLevel + this.system.limit
			if (level > max) {
				relativeLevel = relativeLevel - (level - max)
				level = max
			}
		}

		return {
			level,
			relativeLevel,
			tooltip,
		}

		function getRelativeTechniqueLevel(technique: TechniqueGURPS): number {
			const relative_level = technique.isHardDifficulty() ? points - 1 : points
			return relative_level < 0 ? 0 : relative_level
		}

		function getDefaultSkillLevel(technique: TechniqueGURPS): number {
			if (!(actor instanceof ActorGURPS) || !actor.isOfType(ActorType.Character)) return 0
			if (technique.default.type === gid.Skill) {
				const sk = actor.baseSkill(technique.default, true)
				if (!sk) return 0
				if (!sk.level) sk?.calculateLevel()
				return sk.level.level
			} else if (technique.default) {
				return (
					(technique.default?.skillLevelFast(actor, true, null, false) ?? 0) -
					(technique.default?.modifier ?? 0)
				)
			}
			return 0
		}
	}

	adjustedPoints(tooltip?: TooltipGURPS): number {
		let points = this.points
		if (this.actor?.isOfType(ActorType.Character)) {
			points += this.actor.skillPointBonusFor(this.name!, this.specialization, this.tags, tooltip)
			points = Math.max(points, 0)
		}
		return points
	}

	private isHardDifficulty() {
		return this.difficulty === difficulty.Level.Hard
	}

	/**  Replacements */
	get nameWithReplacements(): string {
		return Nameable.apply(this.system.name, this.nameableReplacements)
	}

	get notesWithReplacements(): string {
		return Nameable.apply(this.system.notes, this.nameableReplacements)
	}

	/** Nameables */
	fillWithNameableKeys(m: Map<string, string>, existing?: Map<string, string>): void {
		if (!existing) existing = this.nameableReplacements

		Nameable.extract(this.system.name, m, existing)
		Nameable.extract(this.system.notes, m, existing)

		this.default.fillWithNameableKeys(m, existing)
		if (this.prereqs) {
			this.prereqs.fillWithNameableKeys(m, existing)
		}
		for (const feature of this.features) {
			feature.fillWithNameableKeys(m, existing)
		}
		for (const weapon of this.itemCollections.weapons) {
			weapon.fillWithNameableKeys(m, existing)
		}
	}
}

interface TechniqueGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractSkillGURPS<TParent> {
	readonly _source: TechniqueSource
	system: TechniqueSystemData
}

export { TechniqueGURPS }
