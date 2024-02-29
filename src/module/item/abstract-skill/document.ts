import { ActorGURPS } from "@actor"
import { AbstractContainerGURPS } from "@item"
import { RitualMagicSpellSource, RitualMagicSpellSystemData } from "@item/ritual-magic-spell/data.ts"
import { SkillLevel, SkillSource, SkillSystemData } from "@item/skill/data.ts"
import { SpellSource, SpellSystemData } from "@item/spell/data.ts"
import { TechniqueSource, TechniqueSystemData } from "@item/technique/data.ts"
import { ActorType, ItemType } from "@module/data/constants.ts"
import { resolveStudyHours } from "@system"
import { TooltipGURPS, difficulty, study } from "@util"

abstract class AbstractSkillGURPS<
	TParent extends ActorGURPS | null = ActorGURPS | null,
> extends AbstractContainerGURPS<TParent> {
	declare level: SkillLevel

	abstract calculateLevel(): SkillLevel
	abstract adjustedPoints(tooltip?: TooltipGURPS): number

	override get formattedName(): string {
		const name: string = this.name ?? ""
		const specialization = this.specialization
		const TL = this.techLevel
		return `${name}${this.techLevelRequired ? `/TL${TL ?? ""}` : ""}${specialization ? ` (${specialization})` : ""}`
	}

	get points(): number {
		return this.system.points
	}

	set points(value: number) {
		this.system.points = value
	}

	get techLevel(): string {
		return this.system.tech_level
	}

	get techLevelRequired(): boolean {
		if (this.isOfType(ItemType.Skill, ItemType.Spell, ItemType.RitualMagicSpell)) {
			return this.system.tech_level_required
		}
		return false
	}

	get attribute(): string {
		return this.system.difficulty?.split("/")[0]
	}

	get difficulty(): difficulty.Level {
		return difficulty.Level.extractLevel(this.system.difficulty?.split("/")[1])
	}

	get specialization(): string {
		if (this.isOfType(ItemType.Skill)) {
			return this.system.specialization
		}
		return ""
	}

	get skillLevel(): string {
		if (this.effectiveLevel === -Infinity) return "-"
		return this.effectiveLevel.toString()
	}

	get relativeLevel(): string {
		const level = this.level
		if (level.level === -Infinity) return "-"
		if (this.actor?.isOfType(ActorType.Character)) {
			return (
				(this.actor?.attributes?.get(this.attribute)?.definition?.name ?? "") +
				level.relativeLevel.signedString()
			)
		}
		return "-"
	}

	get effectiveLevel(): number {
		const actor = this.dummyActor || this.actor
		if (!actor) return -Infinity
		if (actor instanceof ActorGURPS && actor.isOfType(ActorType.Character)) {
			const att = actor.resolveAttributeCurrent(this.attribute)
			const effectiveAtt = actor.resolveAttributeEffective(this.attribute)
			return this.level.level - att + effectiveAtt
		}
		return -Infinity
	}

	updateLevel(): boolean {
		const saved = this.level
		if (this.isOfType(ItemType.Skill)) {
			this.default = this.bestDefaultWithPoints()
		}
		this.level = this.calculateLevel()
		if (saved) return saved.level !== this.level.level
		return true
	}

	setLevel(level: number): Promise<this | undefined> {
		return this.update({ "system.points": this.getPointsForLevel(level) })
	}

	getPointsForLevel(level: number): number {
		const basePoints = this.points
		const oldLevel = this.level.level
		if (oldLevel > level) {
			for (let points = basePoints; points > 0; points--) {
				this.system.points = points
				if (this.calculateLevel().level === level) {
					return points
				}
			}
			return 0
		} else {
			// HACK: capped at 100 points, probably not a good idea
			for (let points = basePoints; points < 100; points++) {
				this.system.points = points
				if (this.calculateLevel().level === level) {
					return points
				}
			}
			return 100
		}
	}

	incrementSkillLevel(options?: DocumentModificationContext<TParent>): void {
		const basePoints = this.points + 1
		let maxPoints = basePoints
		if (this.difficulty === difficulty.Level.Wildcard) maxPoints += 12
		else maxPoints += 4

		const oldLevel = this.level.level
		for (let points = basePoints; points < maxPoints; points++) {
			this.system.points = points
			if (this.calculateLevel().level > oldLevel) {
				this.update({ "system.points": points }, options)
			}
		}
	}

	decrementSkillLevel(options?: DocumentModificationContext<TParent>): void {
		if (this.points <= 0) return
		const basePoints = this.points
		let minPoints = basePoints
		if (this.difficulty === difficulty.Level.Wildcard) minPoints -= 12
		else minPoints -= 4
		minPoints = Math.max(minPoints, 0)

		const oldLevel = this.level.level
		for (let points = basePoints; points >= minPoints; points--) {
			this.system.points = points
			if (this.calculateLevel().level < oldLevel) {
				break
			}
		}

		if (this.points > 0) {
			const oldLevel = this.calculateLevel().level
			while (this.points > 0) {
				this.system.points = Math.max(this.points - 1, 0)
				if (this.calculateLevel().level !== oldLevel) {
					this.system.points += 1
					this.update({ "system.points": this.points }, options)
				}
			}
		}
	}

	get studyHours(): number {
		return resolveStudyHours(this.system.study ?? [])
	}

	get studyHoursNeeded(): string {
		const system = this.system
		if ((system.study_hours_needed as string) === "") return study.Level.Standard
		return system.study_hours_needed
	}
}

interface AbstractSkillGURPS<TParent extends ActorGURPS | null> extends AbstractContainerGURPS<TParent> {
	readonly _source: SkillSource | TechniqueSource | SpellSource | RitualMagicSpellSource
	system: SkillSystemData | TechniqueSystemData | SpellSystemData | RitualMagicSpellSystemData
}

export { AbstractSkillGURPS }
