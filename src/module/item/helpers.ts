import { ActorGURPS } from "@actor"
import { TargetTrait, TargetTraitModifier } from "@module/apps/damage-calculator/index.ts"
import { ABSTRACT_CONTAINER_TYPES, CONTAINER_TYPES, ItemType } from "@module/data/constants.ts"
import { ConditionalModifier, ContainedWeightReduction, Feature } from "@system"
import { Int, Weight, WeightUnits, emcost, emweight, setHasElement } from "@util"
import { AbstractContainerGURPS } from "./abstract-container/document.ts"
import { ItemGURPS } from "./base/document.ts"
import { ItemSourceGURPS } from "./data/index.ts"
import { EquipmentContainerGURPS } from "./equipment-container/document.ts"
import { EquipmentModifierGURPS } from "./equipment-modifier/document.ts"
import { EquipmentGURPS } from "./equipment/document.ts"
import { TraitModifierGURPS } from "./trait-modifier/document.ts"
import { TraitGURPS } from "./trait/document.ts"
import { ItemInstances } from "./types.ts"
import { TraitContainerGURPS } from "./trait-container/document.ts"
import { TraitModifierContainerGURPS } from "./trait-modifier-container/document.ts"
import { SkillContainerGURPS } from "./skill-container/document.ts"
import { SpellContainerGURPS } from "./spell-container/document.ts"
import { EquipmentModifierContainerGURPS } from "./equipment-modifier-container/document.ts"
import { NoteContainerGURPS } from "./note-container/document.ts"

type ItemOrSource = PreCreate<ItemSourceGURPS> | ItemGURPS

interface SheetItem<TItem extends ItemGURPS = ItemGURPS> {
	item: TItem
	indent: number
	isContainer: boolean
	children: SheetItem[]
}

interface SheetItemCollection {
	name?: string
	items: (SheetItem | ConditionalModifier)[]
	types: ItemType[]
}

/** Determine in a type-safe way whether an `ItemGURPS` or `ItemSourceGURPS` is among certain types */
function itemIsOfType<TParent extends ActorGURPS | null, TType extends ItemType>(
	item: ItemOrSource,
	...types: TType[]
): item is ItemInstances<TParent>[TType]
function itemIsOfType<TParent extends ActorGURPS | null>(
	item: ItemOrSource,
	type: "abstract-container",
): item is AbstractContainerGURPS<TParent> | AbstractContainerGURPS<TParent>["_source"]
function itemIsOfType<TParent extends ActorGURPS | null>(
	item: ItemOrSource,
	type: "container",
): item is
	| TraitContainerGURPS<TParent>
	| TraitModifierContainerGURPS<TParent>
	| SkillContainerGURPS<TParent>
	| SpellContainerGURPS<TParent>
	| EquipmentContainerGURPS<TParent>
	| EquipmentModifierContainerGURPS<TParent>
	| NoteContainerGURPS<TParent>
function itemIsOfType<TParent extends ActorGURPS | null, TType extends "abstract-container" | "container" | ItemType>(
	item: ItemOrSource,
	...types: TType[]
): item is TType extends "abstract-container"
	? AbstractContainerGURPS<TParent>
	: TType extends "container"
		?
				| TraitContainerGURPS<TParent>
				| TraitModifierContainerGURPS<TParent>
				| SkillContainerGURPS<TParent>
				| SpellContainerGURPS<TParent>
				| EquipmentContainerGURPS<TParent>
				| EquipmentModifierContainerGURPS<TParent>
				| NoteContainerGURPS<TParent>
		: TType extends ItemType
			? ItemInstances<TParent>[TType]
			: never
function itemIsOfType(item: ItemOrSource, ...types: string[]): boolean {
	return (
		typeof item.type === "string" &&
		types.some(t =>
			t === "abstract-container"
				? setHasElement(ABSTRACT_CONTAINER_TYPES, item.type)
				: t === "container"
					? setHasElement(CONTAINER_TYPES, item.type)
					: item.type === t,
		)
	)
}

function processMultiplyAddWeightStep(
	type: emweight.Type,
	weight: number,
	units: WeightUnits,
	modifiers: Collection<EquipmentModifierGURPS>,
): number {
	let w = 0
	modifiers.forEach(mod => {
		if (!mod.enabled) return
		if (mod.system.weight_type === type) {
			const t = emweight.Type.determineModifierWeightValueTypeFromString(type, mod.system.weight)
			const amt = emweight.Value.extractFraction(t, mod.system.weight)
			if (t === emweight.Value.Addition)
				w += Weight.toPounds(amt.value, Weight.trailingWeightUnitsFromString(mod.system.weight, units))
			else if (t === emweight.Value.PercentageMultiplier)
				weight = (weight * amt.numerator) / (amt.denominator * 100)
			else if (t === emweight.Value.Multiplier) weight = (weight * amt.numerator) / amt.denominator
		}
	})
	return weight + w
}

function weightAdjustedForModifiers(
	weight: number,
	modifiers: Collection<EquipmentModifierGURPS>,
	defUnits: WeightUnits,
): number {
	let percentages = 0
	let w = Int.from(weight)

	modifiers.forEach(mod => {
		if (!mod.enabled) return
		if (mod.system.weight_type === emweight.Type.Original) {
			const t = emweight.Type.determineModifierWeightValueTypeFromString(
				emweight.Type.Original,
				mod.system.weight,
			)
			const amt = emweight.Value.extractFraction(t, mod.system.weight).value
			if (t === emweight.Value.Addition) {
				w += Weight.toPounds(amt, Weight.trailingWeightUnitsFromString(mod.system.weight, defUnits))
			} else {
				percentages += amt
			}
		}
	})
	if (percentages !== 0) w += Number(weight) * (percentages / 100)

	w = processMultiplyAddWeightStep(emweight.Type.Base, w, defUnits, modifiers)
	w = processMultiplyAddWeightStep(emweight.Type.FinalBase, w, defUnits, modifiers)
	w = processMultiplyAddWeightStep(emweight.Type.Final, w, defUnits, modifiers)

	return Math.max(w, 0)
}

function extendedWeightAdjustedForModifiers(
	defUnits: WeightUnits,
	quantity: number,
	baseWeight: number,
	modifiers: Collection<EquipmentModifierGURPS>,
	features: Feature[],
	children: Collection<EquipmentGURPS | EquipmentContainerGURPS>,
	forSkills: boolean,
	weightIgnoredForSkills: boolean,
): number {
	if (quantity <= 0) return 0
	let base = 0
	if (!forSkills || !weightIgnoredForSkills)
		base = Int.from(weightAdjustedForModifiers(baseWeight, modifiers, defUnits))
	if (children.size) {
		let contained = 0
		children.forEach(child => {
			contained += Int.from(child.extendedWeight(forSkills, defUnits))
		})
		let [percentage, reduction] = [0, 0]
		features.forEach(feature => {
			if (feature instanceof ContainedWeightReduction) {
				if (feature.isPercentageReduction) percentage += feature.percentageReduction
				else reduction += Int.from(feature.fixedReduction(defUnits))
			}
		})
		if (percentage >= 100) contained = 0
		else if (percentage > 0) contained -= (contained * percentage) / 100
		base += Math.max(0, contained - reduction)
	}
	return Int.from(base * quantity)
}

function valueAdjustedForModifiers(value: number, modifiers: Collection<EquipmentModifierGURPS>): number {
	let cost = processNonCFStep(emcost.Type.Original, value, modifiers)

	let cf = 0
	modifiers.forEach(mod => {
		if (!mod.enabled) return
		if (mod.costType === emcost.Type.Base) {
			const t = emcost.Type.fromString(emcost.Type.Base, mod.costAmount)
			cf += emcost.Value.extractValue(t, mod.costAmount)
			if (t === emcost.Value.Multiplier) {
				cf -= 1
			}
		}
	})
	if (cf !== 0) {
		cf = Math.max(cf, -0.8)
		cost *= Math.max(cf, -0.8) + 1
	}

	cost = processNonCFStep(emcost.Type.FinalBase, cost, modifiers)

	cost = processNonCFStep(emcost.Type.Final, cost, modifiers)

	return Math.max(cost, 0)
}

function processNonCFStep(costType: emcost.Type, value: number, modifiers: Collection<EquipmentModifierGURPS>): number {
	let [percentages, additions] = [0, 0]
	let cost = value
	modifiers.forEach(mod => {
		if (!mod.enabled) return
		if (mod.costType === costType) {
			const t = emcost.Type.fromString(costType, mod.costAmount)
			const amt = emcost.Value.extractValue(t, mod.costAmount)
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
	})
	cost += additions
	if (percentages !== 0) cost += value * (percentages / 100)
	return cost
}

function calculateModifierPoints(points: number, modifier: number): number {
	return (points * modifier) / 100
}

function modifyPoints(points: number, modifier: number): number {
	return points + calculateModifierPoints(points, modifier)
}

function getItemArtworkName(type: string): string {
	switch (type) {
		case ItemType.Trait:
		case ItemType.TraitContainer:
			return "trait"
		case ItemType.TraitModifier:
		case ItemType.TraitModifierContainer:
			return "trait-modifier"
		case ItemType.Skill:
		case ItemType.Technique:
		case ItemType.SkillContainer:
			return "skill"
		case ItemType.Spell:
		case ItemType.RitualMagicSpell:
		case ItemType.SpellContainer:
			return "spell"
		case ItemType.Equipment:
		case ItemType.EquipmentContainer:
			return "equipment"
		case ItemType.EquipmentModifier:
		case ItemType.EquipmentModifierContainer:
			return "equipment-modifier"
		case ItemType.Note:
		case ItemType.NoteContainer:
			return "note"
		case ItemType.Effect:
		case ItemType.Condition:
			return "effect"
		case ItemType.MeleeWeapon:
			return "melee-weapon"
		case ItemType.RangedWeapon:
			return "ranged-weapon"
		default:
			return "question-mark"
	}
}

/**
 * Adapt a TraitGURPS to the TargetTrait interface expected by the Damage Calculator.
 */
class TraitAdapter implements TargetTrait {
	private trait: TraitGURPS

	// Actor
	//  .traits.contents.find(it => it.name === 'Damage Resistance')
	//  .modifiers.contents.filter(it => it.enabled === true).find(it => it.name === 'Hardened')

	getModifier(name: string): TraitModifierAdapter | undefined {
		return this.modifiers?.find(it => it.name === name)
	}

	get levels(): number {
		return this.trait.levels
	}

	get name(): string {
		return this.trait.name
	}

	get modifiers(): TraitModifierAdapter[] {
		return this.trait.deepModifiers.filter(mod => mod.enabled).map(mod => new TraitModifierAdapter(mod))
	}

	constructor(trait: TraitGURPS) {
		this.trait = trait
	}
}

/**
 * Adapt the TraitModifierGURPS to the interface expected by Damage calculator.
 */
class TraitModifierAdapter implements TargetTraitModifier {
	private modifier: TraitModifierGURPS

	get levels(): number {
		return this.modifier.levels
	}

	get name(): string {
		return this.modifier.name!
	}

	constructor(modifier: TraitModifierGURPS) {
		this.modifier = modifier
	}
}

export {
	TraitAdapter,
	calculateModifierPoints,
	extendedWeightAdjustedForModifiers,
	getItemArtworkName,
	itemIsOfType,
	modifyPoints,
	valueAdjustedForModifiers,
	weightAdjustedForModifiers,
}

export type { SheetItem, SheetItemCollection }
