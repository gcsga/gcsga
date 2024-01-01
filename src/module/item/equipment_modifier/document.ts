import { ItemGCS } from "@item/gcs"
import { SETTINGS, SYSTEM_NAME } from "@module/data"
import { LocalizeGURPS, Weight, WeightUnits, fxp } from "@util"
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

	get weightType(): EquipmentModifierWeightType {
		return this.system.weight_type
	}

	get costAmount(): string {
		return this.system.cost
	}

	get weightAmount(): string {
		return this.system.weight
	}

	get weightUnits(): WeightUnits {
		if (this.actor) return this.actor.weightUnits
		const default_settings = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`)
		return default_settings.default_weight_units
	}

	get costDescription(): string {
		if (
			this.costType === EquipmentModifierCostType.Original &&
			(this.costAmount === "" || this.costAmount === "+0")
		)
			return ""
		return `${parseFloat(this.costAmount).signedString()} ${
			LocalizeGURPS.translations.gurps.item.cost_type[this.costType]
		}`
	}

	get weightDescription(): string {
		if (
			this.weightType === EquipmentModifierWeightType.Original &&
			(this.weightAmount === "" || this.weightAmount.startsWith("+0"))
		)
			return ""
		return `${
			(Weight.fromString(this.weightUnits) >= 0 ? "+" : "") +
			Weight.format(Weight.fromString(this.weightAmount), this.weightUnits)
		} ${LocalizeGURPS.translations.gurps.item.weight_type[this.weightType]}`
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
	units: WeightUnits,
	modifiers: Collection<EquipmentModifierGURPS>
): number {
	let w = 0
	modifiers.forEach(mod => {
		if (!mod.enabled) return
		if (mod.system.weight_type === type) {
			let t = determineModifierWeightValueTypeFromString(type, mod.system.weight)
			let amt = extractFraction(t, mod.system.weight)
			if (t === EquipmentModifierWeightValueType.Addition)
				w += Weight.toPounds(amt.value, Weight.trailingWeightUnitsFromString(mod.system.weight, units))
			else if (t === EquipmentModifierWeightValueType.PercentageMultiplier)
				weight = (weight * amt.numerator) / (amt.denominator * 100)
			else if (t === EquipmentModifierWeightValueType.Multiplier)
				weight = (weight * amt.numerator) / amt.denominator
		}
	})
	return weight + w
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
		if (!mod.enabled) return
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
	return fxp.Int.from(cost)
}
