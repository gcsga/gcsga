import { ActorGURPS2 } from "@module/document/actor.ts"
import { SheetSettings, SkillDefault } from "@system"
import { LocalizeGURPS, StringBuilder, TooltipGURPS, WeightString, WeightUnits, difficulty, display, emcost } from "@util"
import { ActorType, ItemType, gid } from "../constants.ts"
import { EquipmentModifierData } from "./equipment-modifier.ts"
import { EquipmentFieldsTemplate } from "./templates/equipment-fields.ts"

function modifyPoints(points: number, modifier: number): number {
	return points + calculateModifierPoints(points, modifier)
}

function calculateModifierPoints(points: number, modifier: number): number {
	return (points * modifier) / 100
}

function addTooltipForSkillLevelAdj(
	optionChecker: (option: display.Option) => boolean,
	settings: SheetSettings,
	level: SkillLevel,
	buffer: StringBuilder,
): void {
	if (optionChecker(settings.skill_level_adj_display)) {
		if (level.tooltip !== "" && level.tooltip !== LocalizeGURPS.translations.GURPS.Messages.NoAdditionalModifiers) {
			let levelTooltip = level.tooltip
			const msg = LocalizeGURPS.translations.GURPS.Messages.IncludesModifiersFrom
			if (!levelTooltip.startsWith(msg)) levelTooltip = msg + ":" + levelTooltip
			if (optionChecker(display.Option.Inline)) {
				levelTooltip = levelTooltip.replaceAll(/:\n/, ": ").replaceAll(/\n/, ", ")
			}
			buffer.appendToNewLine(levelTooltip)
		}
	}
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
	return {
		level,
		relativeLevel,
		tooltip: tooltip.toString(),
	}
}

function valueAdjustedForModifiers(
	equipment: { system: EquipmentFieldsTemplate },
	value: number,
	modifiers: { system: EquipmentModifierData }[],
): number {
	let cost = processNonCFStep(equipment, emcost.Type.Original, value, modifiers)

	let cf = 0
	for (const mod of modifiers) {
		mod.system.equipment = equipment
		if (mod.system.cost_type === emcost.Type.Base) {
			const t = emcost.Type.fromString(emcost.Type.Base, mod.system.cost)
			cf += emcost.Value.extractValue(t, mod.system.cost) * mod.system.costMultiplier
			if (t === emcost.Value.Multiplier) cf -= 1
		}
	}
	if (cf !== 0) {
		cf = Math.max(cf, -80)
		cost = cost * Math.max(cf, -80) + 1
	}

	// Apply all equipment final base cost
	cost = processNonCFStep(equipment, emcost.Type.FinalBase, value, modifiers)

	// Apply all equipment final cost
	cost = processNonCFStep(equipment, emcost.Type.Final, value, modifiers)

	return Math.max(cost, 0)
}

function weightAdjustedForModifiers(
	equipment: { system: EquipmentFieldsTemplate },
	weight: WeightString,
	modifiers: { system: EquipmentModifierData }[],
	units: WeightUnits,
): number {
	let percentages = 0
}

function processNonCFStep(
	equipment: { system: EquipmentFieldsTemplate },
	costType: emcost.Type,
	value: number,
	modifiers: { system: EquipmentModifierData }[],
): number {
	let [percentages, additions] = [0, 0]
	let cost = value

	for (const mod of modifiers) {
		mod.system.equipment = equipment
		if (mod.system.cost_type === costType) {
			const t = emcost.Type.fromString(costType, mod.system.cost)
			const amt = emcost.Value.extractValue(t, mod.system.cost) * mod.system.costMultiplier
			switch (t) {
				case emcost.Value.Addition:
					additions += amt
					break
				case emcost.Value.Percentage:
					percentages += amt
					break
				case emcost.Value.Multiplier:
					cost *= amt
			}
		}
	}

	cost += additions
	if (percentages !== 0) cost += value * (percentages / 100)
	return cost
}

interface SkillLevel {
	level: number
	relativeLevel: number
	tooltip: string
}

export {
	modifyPoints,
	calculateModifierPoints,
	calculateTechniqueLevel,
	addTooltipForSkillLevelAdj,
	valueAdjustedForModifiers,
	weightAdjustedForModifiers,
}
export type { SkillLevel }
