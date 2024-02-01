import { ActorGURPS } from "@actor/base.ts"
import { ItemGCS } from "@item/gcs/document.ts"
import { EquipmentModifierSystemSource } from "./data.ts"
import { emcost } from "@util/enum/emcost.ts"
import { emweight } from "@util/enum/emweight.ts"
import { Weight, WeightUnits } from "@util/weight.ts"
import { SETTINGS, SYSTEM_NAME } from "@module/data/misc.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { StringBuilder } from "@util/string_builder.ts"
import { sheetSettingsFor } from "@module/data/sheet_settings.ts"
import { Int } from "@util/fxp.ts"
import { ItemType } from "@item/types.ts"
import { CharacterGURPS } from "@actor"
import { CharacterResolver } from "@util"

export interface EquipmentModifierGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends ItemGCS<TParent> {
	system: EquipmentModifierSystemSource
	type: ItemType.EquipmentModifier
}

export class EquipmentModifierGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGCS<TParent> {
	override get enabled(): boolean {
		return !this.system.disabled
	}

	get techLevel(): string {
		return this.system.tech_level
	}

	get costType(): emcost.Type {
		return this.system.cost_type
	}

	get weightType(): emweight.Type {
		return this.system.weight_type
	}

	get costAmount(): string {
		return this.system.cost
	}

	get weightAmount(): string {
		return this.system.weight
	}

	get weightUnits(): WeightUnits {
		if (this.actor instanceof CharacterGURPS) return this.actor.weightUnits
		const default_settings = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`)
		return default_settings.default_weight_units
	}

	get costDescription(): string {
		if (this.costType === emcost.Type.Original && (this.costAmount === "" || this.costAmount === "+0")) return ""
		return `${parseFloat(this.costAmount).signedString()} ${
			LocalizeGURPS.translations.gurps.item.cost_type[this.costType]
		}`
	}

	get weightDescription(): string {
		if (
			this.weightType === emweight.Type.Original &&
			(this.weightAmount === "" || this.weightAmount.startsWith("+0"))
		)
			return ""
		return `${
			(Weight.fromString(this.weightUnits) >= 0 ? "+" : "") +
			Weight.format(Weight.fromString(this.weightAmount), this.weightUnits)
		} ${emweight.Type.toString(this.weightType)}`
	}

	get fullDescription(): string {
		const buffer = new StringBuilder()
		buffer.push(this.formattedName)
		if (this.localNotes !== "") {
			buffer.push(` (${this.localNotes})`)
		}
		if (sheetSettingsFor(this.actor as unknown as CharacterResolver).show_equipment_modifier_adj) {
			const costDesc = this.costDescription
			const weightDesc = this.weightDescription
			if (costDesc !== "" || weightDesc !== "") {
				buffer.push(" [")
				buffer.push(costDesc)
				if (weightDesc !== "") {
					if (costDesc !== "") buffer.push("; ")
					buffer.push(weightDesc)
				}
				buffer.push("]")
			}
		}
		return buffer.toString()
	}
}

export function weightAdjustedForModifiers(
	weight: number,
	modifiers: Collection<EquipmentModifierGURPS>,
	defUnits: WeightUnits,
): number {
	let percentages = 0
	let w = Int.from(weight)

	// apply all equipment.OriginalWeight
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

export function valueAdjustedForModifiers(value: number, modifiers: Collection<EquipmentModifierGURPS>): number {
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
