import { fxp } from "@util"

export enum EquipmentModifierCostType {
	Original = "to_original_cost",
	Base = "to_base_cost",
	FinalBase = "to_final_base_cost",
	Final = "to_final_cost",
}

export enum EquipmentModifierCostValueType {
	Addition = "+",
	Percentage = "%",
	Multiplier = "x",
	CostFactor = "CF",
}

const PermittedValueTypes: Record<EquipmentModifierCostType, EquipmentModifierCostValueType[]> = {
	[EquipmentModifierCostType.Original]: [
		EquipmentModifierCostValueType.Addition,
		EquipmentModifierCostValueType.Percentage,
		EquipmentModifierCostValueType.Multiplier,
	],
	[EquipmentModifierCostType.Base]: [
		EquipmentModifierCostValueType.CostFactor,
		EquipmentModifierCostValueType.Multiplier,
	],
	[EquipmentModifierCostType.Final]: [
		EquipmentModifierCostValueType.Addition,
		EquipmentModifierCostValueType.Percentage,
		EquipmentModifierCostValueType.Multiplier,
	],
	[EquipmentModifierCostType.FinalBase]: [
		EquipmentModifierCostValueType.Addition,
		EquipmentModifierCostValueType.Percentage,
		EquipmentModifierCostValueType.Multiplier,
	],
}

export function determineModifierCostValueTypeFromString(
	type: EquipmentModifierCostType,
	s: string
): EquipmentModifierCostValueType {
	function fromString(s: string): EquipmentModifierCostValueType {
		s = s.trim().toLowerCase()
		switch (true) {
			case s.endsWith(EquipmentModifierCostValueType.CostFactor):
				return EquipmentModifierCostValueType.CostFactor
			case s.endsWith(EquipmentModifierCostValueType.Percentage):
				return EquipmentModifierCostValueType.Percentage
			case s.startsWith(EquipmentModifierCostValueType.Multiplier):
				return EquipmentModifierCostValueType.Multiplier
			case s.endsWith(EquipmentModifierCostValueType.Multiplier):
				return EquipmentModifierCostValueType.Multiplier
			default:
				return EquipmentModifierCostValueType.Addition
		}
	}
	const cvt = fromString(s)
	const permitted = PermittedValueTypes[type]
	return permitted.find(e => e === cvt) ?? permitted[0]
}

export function extractValue(type: EquipmentModifierCostValueType, s: string): number {
	let v = fxp.Int.fromStringForced(s)
	if (type === EquipmentModifierCostValueType.Multiplier && v <= 0) v = 1
	return v
}
