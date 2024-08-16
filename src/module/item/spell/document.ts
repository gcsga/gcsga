import { ActorGURPS } from "@actor"
import { AbstractSkillGURPS } from "@item"
import { SpellSource, SpellSystemData } from "./data.ts"
import { SkillLevel } from "@item/skill/data.ts"
import { LocalizeGURPS, NewLineRegex, StringBuilder, TooltipGURPS, difficulty, display } from "@util"
import { SheetSettings, resolveStudyHours, studyHoursProgressText } from "@system"
import { ActorType } from "@module/data/constants.ts"
import { Nameable } from "@module/util/nameable.ts"

class SpellGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractSkillGURPS<TParent> {
	override secondaryText(optionChecker: (option: display.Option) => boolean): string {
		const buffer = new StringBuilder()
		const settings = SheetSettings.for(this.actor)
		if (optionChecker(settings.notes_display)) {
			buffer.appendToNewLine(this.notes.trim())
			buffer.appendToNewLine(this.rituals)
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

	get college(): string[] {
		return this.system.college
	}

	get powerSource(): string {
		return this.system.power_source
	}

	get rituals(): string {
		if (!this.actor) return ""
		const level = this.level?.level ?? 0
		switch (true) {
			case level < 10:
				return LocalizeGURPS.translations.gurps.ritual.sub_10
			case level < 15:
				return LocalizeGURPS.translations.gurps.ritual.sub_15
			case level < 20: {
				let ritual = LocalizeGURPS.translations.gurps.ritual.sub_20
				// TODO: localization
				if (this.system.spell_class.toLowerCase() === "blocking") return ritual
				ritual += LocalizeGURPS.format(LocalizeGURPS.translations.gurps.ritual.cost, {
					adj: 1,
				})
				return ritual
			}
			default: {
				const adj = Math.trunc((level - 15) / 5)
				const spellClass = this.system.spell_class.toLowerCase()
				let time = ""
				if (!spellClass.includes("missile"))
					time = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.ritual.time, {
						adj: Math.pow(2, adj),
					})
				let cost = ""
				if (!spellClass.includes("blocking")) {
					cost = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.ritual.cost, {
						adj: adj + 1,
					})
				}
				return LocalizeGURPS.translations.gurps.ritual.none + time + cost
			}
		}
	}

	adjustedPoints(tooltip?: TooltipGURPS): number {
		let points = this.points
		if (this.actor?.isOfType(ActorType.Character)) {
			points += this.actor.spellPointBonusesFor(
				this.name!,
				this.system.power_source,
				this.system.college,
				this.tags,
				tooltip,
			)
			points = Math.max(points, 0)
		}
		return points
	}

	calculateLevel(): SkillLevel {
		const none = { level: Number.MIN_SAFE_INTEGER, relativeLevel: 0, tooltip: new TooltipGURPS() }
		const actor = this.dummyActor || this.actor
		if (!actor) return none
		if (actor instanceof ActorGURPS && actor.isOfType(ActorType.Character)) {
			const tooltip = new TooltipGURPS()
			let relativeLevel = difficulty.Level.baseRelativeLevel(this.difficulty)
			let level = actor.resolveAttributeCurrent(this.attribute)
			let points = Math.trunc(this.points)
			level = actor.resolveAttributeCurrent(this.attribute)
			if (this.difficulty === difficulty.Level.Wildcard) points = Math.trunc(points / 3)
			switch (true) {
				case points === 1:
					// relativeLevel is preset to this point value
					break
				case points > 1 && points < 4:
					relativeLevel += 1
					break
				case points >= 4:
					relativeLevel += 1 + Math.floor(points / 4)
					break
				default:
					level = Number.MIN_SAFE_INTEGER
					relativeLevel = 0
			}
			if (level !== Number.MIN_SAFE_INTEGER) {
				relativeLevel += actor.spellBonusFor(
					this.name!,
					this.system.power_source,
					this.system.college,
					this.tags,
					tooltip,
				)
				relativeLevel = Math.trunc(relativeLevel)
				level += relativeLevel
			}
			return {
				level,
				relativeLevel,
				tooltip,
			}
		}
		return none
	}

	/**  Replacements */
	get notesWithReplacements(): string {
		return Nameable.apply(this.system.notes, this.nameableReplacements)
	}

	get powerSourceWithReplacements(): string {
		return Nameable.apply(this.system.power_source, this.nameableReplacements)
	}

	get classWithReplacements(): string {
		return Nameable.apply(this.system.spell_class, this.nameableReplacements)
	}

	get resistWithReplacements(): string {
		return Nameable.apply(this.system.resist, this.nameableReplacements)
	}

	get castingCostWithReplacements(): string {
		return Nameable.apply(this.system.casting_cost, this.nameableReplacements)
	}

	get maintenanceCostWithReplacements(): string {
		return Nameable.apply(this.system.maintenance_cost, this.nameableReplacements)
	}

	get castingTimeWithReplacements(): string {
		return Nameable.apply(this.system.casting_time, this.nameableReplacements)
	}

	get durationWithReplacements(): string {
		return Nameable.apply(this.system.duration, this.nameableReplacements)
	}

	get collegeWithReplacements(): string[] {
		return Nameable.applyToList(this.system.college, this.nameableReplacements)
	}

	/** Nameables */
	fillWithNameableKeys(m: Map<string, string>, existing?: Map<string, string>): void {
		if (!existing) existing = this.nameableReplacements

		Nameable.extract(this.system.name, m, existing)
		Nameable.extract(this.system.notes, m, existing)
		Nameable.extract(this.system.power_source, m, existing)
		Nameable.extract(this.system.spell_class, m, existing)
		Nameable.extract(this.system.resist, m, existing)
		Nameable.extract(this.system.casting_cost, m, existing)
		Nameable.extract(this.system.maintenance_cost, m, existing)
		Nameable.extract(this.system.casting_time, m, existing)
		Nameable.extract(this.system.duration, m, existing)
		for (const one of this.system.college) {
			Nameable.extract(one, m, existing)
		}

		if (this.prereqs) {
			this.prereqs.fillWithNameableKeys(m, existing)
		}
		for (const weapon of this.itemCollections.weapons) {
			weapon.fillWithNameableKeys(m, existing)
		}
	}
}

interface SpellGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractSkillGURPS<TParent> {
	readonly _source: SpellSource
	system: SpellSystemData
}

export { SpellGURPS }
