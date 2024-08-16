import { ActorGURPS } from "@actor"
import { AbstractSkillGURPS } from "@item"
import { RitualMagicSpellSource, RitualMagicSpellSystemData } from "./data.ts"
import { LocalizeGURPS, StringBuilder, TooltipGURPS, difficulty } from "@util"
import { ActorType, gid } from "@module/data/constants.ts"
import { SkillLevel } from "@item/skill/data.ts"
import { SkillDefault } from "@system"
import { Nameable } from "@module/util/nameable.ts"

class RitualMagicSpellGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractSkillGURPS<TParent> {
	get college(): string[] {
		return this.system.college
	}

	get powerSource(): string {
		return this.system.power_source
	}

	get baseSkill(): string {
		return this.system.base_skill
	}

	get prereqCount(): number {
		return this.system.prereq_count
	}

	calculateLevel(): SkillLevel {
		let skillLevel: SkillLevel = {
			level: Number.MIN_SAFE_INTEGER,
			relativeLevel: 0,
			tooltip: new TooltipGURPS(),
		}
		if (this.college.length === 0) skillLevel = this.determineLevelForCollege("")
		else {
			for (const c of this.college) {
				const possible = this.determineLevelForCollege(c)
				if (skillLevel.level < possible.level) skillLevel = possible
			}
		}
		if (this.actor?.isOfType(ActorType.Character)) {
			const tooltip = new TooltipGURPS()
			tooltip.push(skillLevel.tooltip)
			const levels = Math.trunc(
				this.actor.spellBonusFor(this.name!, this.powerSource, this.college, this.tags, tooltip),
			)
			skillLevel.level += levels
			skillLevel.relativeLevel += levels
			skillLevel.tooltip = tooltip
		}
		return {
			level: skillLevel.level,
			relativeLevel: skillLevel.relativeLevel,
			tooltip: skillLevel.tooltip,
		}
	}

	private determineLevelForCollege(college: string): SkillLevel {
		const def = new SkillDefault({
			type: gid.Skill,
			name: this.baseSkill,
			specialization: college,
			modifier: -this.prereqCount,
		})
		if (college === "") def.name = ""
		const limit = 0
		const skillLevel = this.calculateLevelAsTechnique(def, college, limit)
		skillLevel.relativeLevel += def.modifier
		def.specialization = ""
		def.modifier -= 6
		const fallback = this.calculateLevelAsTechnique(def, college, limit)
		fallback.relativeLevel += def.modifier
		if (skillLevel.level >= def.modifier) return skillLevel
		return fallback
	}

	private calculateLevelAsTechnique(def: SkillDefault, college: string, limit: number): SkillLevel {
		const tooltip = new TooltipGURPS()
		let relativeLevel = 0
		let points = this.adjustedPoints()
		let level = Number.MIN_SAFE_INTEGER
		if (this.actor?.isOfType(ActorType.Character)) {
			if (def?.type === gid.Skill) {
				const sk = this.actor.baseSkill(def!, true)
				if (sk) level = sk.level.level
			} else if (def) {
				level = (def?.skillLevelFast(this.actor, true, null, false) || 0) - (def?.modifier || 0)
			}
			if (level !== Number.MIN_SAFE_INTEGER) {
				const base_level = level
				level += def.modifier
				if (this.difficulty === difficulty.Level.Hard) points -= 1
				if (points > 0) relativeLevel = points
				if (level !== Number.MIN_SAFE_INTEGER) {
					relativeLevel += this.actor.skillBonusFor(this.name!, college, this.tags, tooltip)
					level += relativeLevel
				}
				if (limit) {
					const max = base_level + limit
					if (level > max) {
						relativeLevel -= level - max
						level = max
					}
				}
			}
		}
		return {
			level,
			relativeLevel,
			tooltip,
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

	satisfied(tooltip: TooltipGURPS): boolean {
		const colleges = this.collegeWithReplacements
		if (colleges.length === 0) {
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.prefix)
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.ritual_magic_spell.college)
			return false
		}

		const actor = this.actor
		if (!actor || !actor.isOfType(ActorType.Character)) return true

		for (const college of colleges) {
			if (actor.bestSkillNamed(this.baseSkillWithReplacements, college, false, null) !== null) return true
		}

		const ritual = this.baseSkillWithReplacements
		const skillName = new StringBuilder()
		skillName.push(ritual)
		skillName.push(` (${colleges[0]})`)
		for (const college of colleges.splice(1)) {
			skillName.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.ritual_magic_spell.or, {
					name: `${ritual} (${college})`,
				}),
			)
		}

		tooltip.push(LocalizeGURPS.translations.gurps.prereq.prefix)
		tooltip.push(
			LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.ritual_magic_spell.skill, {
				name: skillName.toString(),
			}),
		)

		return false
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

	get baseSkillWithReplacements(): string {
		return Nameable.apply(this.system.base_skill, this.nameableReplacements)
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
		Nameable.extract(this.system.base_skill, m, existing)
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

interface RitualMagicSpellGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends AbstractSkillGURPS<TParent> {
	readonly _source: RitualMagicSpellSource
	system: RitualMagicSpellSystemData
}

export { RitualMagicSpellGURPS }
