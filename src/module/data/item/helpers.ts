import { ActorGURPS2 } from "@module/document/actor.ts"
import { SkillDefault } from "@system"
import { StringBuilder, TooltipGURPS, difficulty } from "@util"
import { ActorType, ItemType, gid } from "../constants.ts"

function modifyPoints(points: number, modifier: number): number {
	return points + calculateModifierPoints(points, modifier)
}

function calculateModifierPoints(points: number, modifier: number): number {
	return (points * modifier) / 100
}

function calculateTechniqueLevel(
	actor: ActorGURPS2 | null,
	replacements: Map<string, string>,
	name: string,
	specialization: string,
	tags: string[],
	def: SkillDefault,
	diffLevel: difficulty.Level,
	points: number,
	requirePoints: boolean,
	limitModifier: number | null,
	excludes: Set<string> = new Set(),
): SkillLevel {
	const tooltip = new TooltipGURPS()
	let relativeLevel = 0
	let level = Number.MIN_SAFE_INTEGER
	if (actor?.isOfType(ActorType.Character)) {
		if (def.type === gid.Skill) {
			const defName = def.nameWithReplacements(replacements)
			const defSpec = def.specializationWithReplacements(replacements)
			const list = actor.system.skillNamed(defName, defSpec, requirePoints, excludes)
			if (list.length > 0) {
				const sk = list[0]
				const buffer = new StringBuilder()
				buffer.push(defName)
				if (defSpec !== "") buffer.push(` (${defSpec})`)
				excludes.add(buffer.toString())
				if (sk.isOfType(ItemType.Technique)) {
					if (
						sk.system.default !== null &&
						(sk.system.default.nameWithReplacements(replacements) !== name ||
							sk.system.default.specializationWithReplacements(replacements) !== specialization)
					) {
						level = sk.system.calculateLevel(excludes).level
					}
				} else if (sk.isOfType(ItemType.Skill)) {
					if (
						sk.system.defaulted_from !== null &&
						(sk.system.defaulted_from.nameWithReplacements(replacements) !== name ||
							sk.system.defaulted_from.specializationWithReplacements(replacements) !== specialization)
					) {
						level = sk.system.calculateLevel(excludes).level
					}
				}
			}
		} else {
			level = def.skillLevelFast(actor, replacements, true) - def.modifier
		}

		if (level !== Number.MIN_SAFE_INTEGER) {
			const baseLevel = level
			level += def.modifier
			if (diffLevel === difficulty.Level.Hard) points -= 1
			if (points > 0) relativeLevel = points
			if (level !== Number.MIN_SAFE_INTEGER) {
				relativeLevel += actor.system.skillBonusFor(name, specialization, tags, tooltip)
				level += relativeLevel
			}
			if (limitModifier !== null) {
				const maximum = baseLevel + limitModifier
				if (level > maximum) {
					relativeLevel -= level - maximum
					level = maximum
				}
			}
		}
	}
}

interface SkillLevel {
	level: number
	relativeLevel: number
	tooltip: string
}

export { modifyPoints, calculateModifierPoints, calculateTechniqueLevel }
export type { SkillLevel }
