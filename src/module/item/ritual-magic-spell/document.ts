import { ActorGURPS } from "@actor"
import { AbstractSkillGURPS } from "@item"
import { RitualMagicSpellSource, RitualMagicSpellSystemData } from "./data.ts"
import { TooltipGURPS, difficulty } from "@util"
import { ActorType, gid } from "@module/data/constants.ts"
import { SkillLevel } from "@item/skill/data.ts"
import { SkillDefault } from "@system"

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
			level: -Infinity,
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
		let level = -Infinity
		if (this.actor?.isOfType(ActorType.Character)) {
			if (def?.type === gid.Skill) {
				const sk = this.actor.baseSkill(def!, true)
				if (sk) level = sk.level.level
			} else if (def) {
				level = (def?.skillLevelFast(this.actor, true, null, false) || 0) - (def?.modifier || 0)
			}
			if (level !== -Infinity) {
				const base_level = level
				level += def.modifier
				if (this.difficulty === difficulty.Level.Hard) points -= 1
				if (points > 0) relativeLevel = points
				if (level !== -Infinity) {
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
}

interface RitualMagicSpellGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends AbstractSkillGURPS<TParent> {
	readonly _source: RitualMagicSpellSource
	system: RitualMagicSpellSystemData
}

export { RitualMagicSpellGURPS }
