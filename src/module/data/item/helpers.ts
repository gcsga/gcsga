import { ActorGURPS2 } from "@module/document/actor.ts"
import { SheetSettings, SkillDefault } from "@system"
import {
	Int,
	LocalizeGURPS,
	StringBuilder,
	TooltipGURPS,
	Weight,
	difficulty,
	display,
	emcost,
	emweight,
	feature,
} from "@util"
import { ActorType, ItemType, gid } from "../constants.ts"
import { AttributeDifficulty } from "./fields/attribute-difficulty.ts"
import { ActorTemplateType } from "../actor/types.ts"
import type { ItemGURPS2 } from "@module/document/item.ts"
import { ItemDataInstances, ItemDataTemplates, ItemTemplateType } from "./types.ts"
import { Feature } from "../feature/types.ts"

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
	equipment: ItemInst<ItemType.Equipment | ItemType.EquipmentContainer>,
	value: number,
	modifiers: ItemInst<ItemType.EquipmentModifier>[],
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
	equipment: ItemInst<ItemType.Equipment | ItemType.EquipmentContainer>,
	weight: string,
	modifiers: ItemInst<ItemType.EquipmentModifier>[],
	defUnits: Weight.Unit,
): number {
	let percentages = 0
	let [w] = Weight.fromString(weight)

	for (const mod of modifiers) {
		mod.system.equipment = equipment
		if (mod.system.weight_type === emweight.Type.Original) {
			const t = emweight.Type.determineModifierWeightValueTypeFromString(
				emweight.Type.Original,
				mod.system.weight,
			)
			const f = emweight.Value.extractFraction(t, mod.system.weight)
			f.normalize()
			f.numerator *= mod.system.weightMultiplier
			const amt = f.value
			if (t === emweight.Value.Addition) {
				w += Weight.toPounds(amt, Weight.trailingUnitFromString(mod.system.weight, defUnits))
			} else {
				percentages += amt
			}
		}
	}

	if (percentages !== 0) w += Int.fromStringForced(weight) * (percentages / 100)

	// Apply all base
	w = processMultiplyAddWeightStep(equipment, emweight.Type.Base, w, defUnits, modifiers)

	// Apply all final base
	w = processMultiplyAddWeightStep(equipment, emweight.Type.FinalBase, w, defUnits, modifiers)

	// Apply all final
	w = processMultiplyAddWeightStep(equipment, emweight.Type.Final, w, defUnits, modifiers)

	return Int.from(Math.max(w, 0))
}

function extendedWeightAdjustedForModifiers(
	equipment: ItemInst<ItemType.Equipment | ItemType.EquipmentContainer>,
	defUnits: Weight.Unit,
	qty: number,
	baseWeight: string,
	modifiers: ItemInst<ItemType.EquipmentModifier>[],
	features: Feature[],
	children: ItemInst<ItemType.Equipment | ItemType.EquipmentContainer>[],
	forSkills: boolean,
	weightIgnoredForSkills: boolean,
): number {
	if (qty <= 0) return 0

	let base = 0
	if (!forSkills || !weightIgnoredForSkills) {
		base = Int.from(weightAdjustedForModifiers(equipment, baseWeight, modifiers, defUnits))
	}
	if (children.length !== 0) {
		let contained = 0
		for (const child of children) {
			contained += Int.from(child.system.extendedWeight(forSkills, defUnits))
		}
		let [percentage, reduction] = [0, 0]
		for (const f of features) {
			if (f.isOfType(feature.Type.ContainedWeightReduction)) {
				if (f.isPercentageReduction) percentage += f.percentageReduction
				else reduction += f.fixedReduction(defUnits)
			}
		}

		if (percentage >= 100) contained = 0
		else if (percentage > 0) contained -= Int.from((contained * percentage) / 100)

		base += Math.max(contained - reduction, 0)
	}
	return Int.from(base * qty)
}

function processNonCFStep(
	equipment: ItemInst<ItemType.Equipment | ItemType.EquipmentContainer>,
	costType: emcost.Type,
	value: number,
	modifiers: ItemInst<ItemType.EquipmentModifier>[],
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

function processMultiplyAddWeightStep(
	equipment: ItemInst<ItemType.Equipment | ItemType.EquipmentContainer>,
	weightType: emweight.Type,
	weight: number,
	defUnits: Weight.Unit,
	modifiers: ItemInst<ItemType.EquipmentModifier>[],
): number {
	let sum = 0
	for (const mod of modifiers) {
		mod.system.equipment = equipment
		if (mod.system.weight_type === weightType) {
			const t = emweight.Type.determineModifierWeightValueTypeFromString(weightType, mod.system.weight)
			const f = emweight.Value.extractFraction(t, mod.system.weight)
			f.normalize()
			f.numerator *= mod.system.weightMultiplier
			switch (t) {
				case emweight.Value.Addition:
					sum += Weight.toPounds(f.value, Weight.trailingUnitFromString(mod.system.weight, defUnits))
					break
				case emweight.Value.PercentageMultiplier:
					weight = Int.from((weight * f.numerator) / (f.denominator * 100))
					break
				case emweight.Value.Multiplier:
					weight = Int.from((weight * f.numerator) / f.denominator)
			}
		}
	}
	return (weight += sum)
}

function formatRelativeSkill(
	actor: ActorGURPS2 | null,
	numOnly: boolean,
	difficulty: AttributeDifficulty,
	rsl: number,
): string {
	switch (true) {
		case rsl === Number.MIN_SAFE_INTEGER:
			return "-"
		case numOnly:
			return Math.trunc(rsl).signedString()
		default: {
			if (actor === null || !actor.hasTemplate(ActorTemplateType.Attributes)) {
				console.error("Error formatting relative level: Actor is not an attribute holder.")
				return "-"
			}
			let s = actor.system.resolveAttributeName(difficulty.attribute)
			rsl = Math.trunc(rsl)
			if (rsl !== 0) {
				s += rsl.signedString()
			}
			return s
		}
	}
}

interface SkillLevel {
	level: number
	relativeLevel: number
	tooltip: string
}

type ItemInst<T extends ItemType> = ItemGURPS2 & { system: ItemDataInstances[T] }

type ItemTemplateInst<T extends ItemTemplateType> = ItemGURPS2 & { system: ItemDataTemplates[T] }

export {
	modifyPoints,
	calculateModifierPoints,
	calculateTechniqueLevel,
	addTooltipForSkillLevelAdj,
	valueAdjustedForModifiers,
	weightAdjustedForModifiers,
	extendedWeightAdjustedForModifiers,
	formatRelativeSkill,
}
export type { SkillLevel, ItemInst, ItemTemplateInst }
