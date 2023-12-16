import { ItemGCS } from "@item/gcs"
import { SETTINGS, SYSTEM_NAME } from "@module/data"
import { Weight, WeightUnits, fxp } from "@util"
import { EquipmentModifierSource } from "./data"
import {
	EquipmentModifierWeightType,
	EquipmentModifierWeightValueType,
	determineModifierWeightValueTypeFromString,
	extractFraction,
} from "./weight"
import {
	EquipmentModifierCostType,
	EquipmentModifierCostValueType,
	determineModifierCostValueTypeFromString,
	extractValue,
} from "./cost"

export class EquipmentModifierGURPS extends ItemGCS<EquipmentModifierSource> {
	get enabled(): boolean {
		return !this.system.disabled
	}

	get techLevel(): string {
		return this.system.tech_level
	}

	get costType(): EquipmentModifierCostType {
		return this.system.cost_type
	}

	get costAmount(): string {
		return this.system.cost
	}

	get weightUnits(): WeightUnits {
		if (this.actor) return this.actor.weightUnits
		const default_settings = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`)
		return default_settings.default_weight_units
	}
}

export function weightAdjustedForModifiers(
	weight: number,
	modifiers: Collection<EquipmentModifierGURPS>,
	defUnits: WeightUnits
): number {
	let percentages = 0
	let w = fxp.Int.from(weight)

	// apply all equipment.OriginalWeight
	modifiers.forEach(mod => {
		if (!mod.enabled) return
		if (mod.system.weight_type === EquipmentModifierWeightType.Original) {
			let t = determineModifierWeightValueTypeFromString(EquipmentModifierWeightType.Original, mod.system.weight)
			let amt = extractFraction(t, mod.system.weight).value
			if (t === EquipmentModifierWeightValueType.Addition) {
				w += Weight.toPounds(amt, Weight.trailingWeightUnitsFromString(mod.system.weight, defUnits))
			} else {
				percentages += amt
			}
		}
	})
	if (percentages !== 0) w += Number(weight) * (percentages / 100)

	w = processMultiplyAddWeightStep(EquipmentModifierWeightType.Base, w, defUnits, modifiers)
	w = processMultiplyAddWeightStep(EquipmentModifierWeightType.FinalBase, w, defUnits, modifiers)
	w = processMultiplyAddWeightStep(EquipmentModifierWeightType.Final, w, defUnits, modifiers)

	return Math.max(w, 0)
}

function processMultiplyAddWeightStep(
	type: EquipmentModifierWeightType,
	weight: number,
	_units: WeightUnits,
	modifiers: Collection<EquipmentModifierGURPS>
): number {
	let sum = 0
	for (const mod of modifiers) {
		if (mod.system.weight === type) {
			const t = determineModifierWeightValueTypeFromString(type, mod.system.weight)
			const f = extractFraction(t, mod.system.weight)
			if (t === EquipmentModifierWeightValueType.Addition) sum += parseFloat(mod.system.weight)
			else if (t === EquipmentModifierWeightValueType.PercentageMultiplier)
				weight = (weight * f.numerator) / (f.denominator * 100)
			else if (t === EquipmentModifierWeightValueType.Multiplier) weight = (weight * f.numerator) / f.denominator
		}
	}
	return weight + sum
}

export function valueAdjustedForModifiers(value: number, modifiers: Collection<EquipmentModifierGURPS>): number {
	let cost = processNonCFStep(EquipmentModifierCostType.Original, value, modifiers)

	let cf = 0
	modifiers.forEach(mod => {
		if (!mod.enabled) return
		if (mod.costType === EquipmentModifierCostType.Base) {
			let t = determineModifierCostValueTypeFromString(EquipmentModifierCostType.Base, mod.costAmount)
			cf += extractValue(t, mod.costAmount)
			if (t === EquipmentModifierCostValueType.Multiplier) cf--
		}
	})
	if (cf !== 0) {
		cf = Math.max(cf, -0.8)
		cost *= cf + 1
	}

	cost = processNonCFStep(EquipmentModifierCostType.FinalBase, cost, modifiers)
	cost = processNonCFStep(EquipmentModifierCostType.Final, cost, modifiers)

	return Math.max(cost, 0)
}

function processNonCFStep(
	costType: EquipmentModifierCostType,
	value: number,
	modifiers: Collection<EquipmentModifierGURPS>
): number {
	let [percentages, additions] = [0, 0]
	let cost = value
	modifiers.forEach(mod => {
		if (mod.costType === costType) {
			const t = determineModifierCostValueTypeFromString(costType, mod.costAmount)
			const amt = extractValue(t, mod.costAmount)
			switch (t) {
				case EquipmentModifierCostValueType.Addition:
					additions += amt
					break
				case EquipmentModifierCostValueType.Percentage:
					percentages += amt
					break
				case EquipmentModifierCostValueType.Multiplier:
					cost *= amt
			}
		}
	})
	cost += additions
	if (percentages !== 0) cost += value * (percentages / 100)
	return cost
}
