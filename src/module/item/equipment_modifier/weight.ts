// export function determineModWeightValueTypeFromString(
// 	s: string,
// 	type: EquipmentWeightType
// ): WeightValueType {
// s = s.toLowerCase().trim()
// if (s.endsWith("%")) {
// 	if (s.startsWith("x")) return WeightValueType.PercentageMultiplier
// 	return WeightValueType.PercentageAddition
// } else if (s.endsWith("x") || s.startsWith("x")) return WeightValueType.Multiplier
// return WeightValueType.Addition
// }

import { fxp } from "@util"

export enum EquipmentModifierWeightType {
	Original = "to_original_weight",
	Base = "to_base_weight",
	FinalBase = "to_final_base_weight",
	Final = "to_final_weight",
}

export enum EquipmentModifierWeightValueType {
	Addition = "+",
	PercentageAddition = "%",
	PercentageMultiplier = "x%",
	Multiplier = "x",
}

const PermittedValueTypes: Record<EquipmentModifierWeightType, EquipmentModifierWeightValueType[]> = {
	[EquipmentModifierWeightType.Original]: [
		EquipmentModifierWeightValueType.Addition,
		EquipmentModifierWeightValueType.PercentageAddition,
	],
	[EquipmentModifierWeightType.Base]: [
		EquipmentModifierWeightValueType.Addition,
		EquipmentModifierWeightValueType.PercentageMultiplier,
		EquipmentModifierWeightValueType.Multiplier,
	],
	[EquipmentModifierWeightType.Final]: [
		EquipmentModifierWeightValueType.Addition,
		EquipmentModifierWeightValueType.PercentageMultiplier,
		EquipmentModifierWeightValueType.Multiplier,
	],
	[EquipmentModifierWeightType.FinalBase]: [
		EquipmentModifierWeightValueType.Addition,
		EquipmentModifierWeightValueType.PercentageMultiplier,
		EquipmentModifierWeightValueType.Multiplier,
	],
}

export function determineModifierWeightValueTypeFromString(
	type: EquipmentModifierWeightType,
	s: string
): EquipmentModifierWeightValueType {
	function fromString(s: string): EquipmentModifierWeightValueType {
		s = s.trim().toLowerCase()
		switch (true) {
			case s.endsWith("%"):
				if (s.startsWith("x")) return EquipmentModifierWeightValueType.PercentageMultiplier
				return EquipmentModifierWeightValueType.PercentageAddition
			case s.startsWith("x"):
				return EquipmentModifierWeightValueType.Multiplier
			case s.endsWith("x"):
				return EquipmentModifierWeightValueType.Multiplier
			default:
				return EquipmentModifierWeightValueType.Addition
		}
	}
	const mvt = fromString(s)
	const permitted = PermittedValueTypes[type]
	return permitted.find(e => e === mvt) ?? permitted[0]
}

export function extractFraction(type: EquipmentModifierWeightValueType, s: string): fxp.Fraction {
	s = s.trim().replace(new RegExp(`^${EquipmentModifierWeightValueType.Multiplier}*`), "")
	while (s.length > 0 && s.at(-1)?.match(/[0-9]/)) s = s.substring(0, s.length - 1)
	const fraction = fxp.Fraction.new(s)
	switch (type) {
		case EquipmentModifierWeightValueType.PercentageMultiplier:
			if (fraction.numerator <= 0) {
				fraction.numerator = 100
				fraction.denominator = 1
			}
			break
		case EquipmentModifierWeightValueType.Multiplier:
			if (fraction.numerator <= 0) {
				fraction.numerator = 1
				fraction.denominator = 1
			}
	}
	return fraction
}

// if (typeof s !== "string") s = `${s}`
// let v = s.trim()
// while (v.length > 0 && v.at(-1)?.match("[0-9]")) {
// 	v = v.substring(0, v.length - 1)
// }
// const f = v.split("/")
// const fraction: Fraction = {
// 	numerator: parseInt(f[0]) || 0,
// 	denominator: parseInt(f[1]) || 1,
// }
// const revised = determineModifierWeightValueTypeFromString(s)
// if (revised === "weight_percentage_multiplier") {
// 	if (fraction.numerator <= 0) {
// 		fraction.numerator = 100
// 		fraction.denominator = 1
// 	}
// } else if (revised === "weight_multiplier") {
// 	if (fraction.numerator <= 0) {
// 		fraction.numerator = 1
// 		fraction.denominator = 1
// 	}
// }
// return fraction
// }
