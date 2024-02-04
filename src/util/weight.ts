import { Int } from "./fxp.ts"

export class Weight {
	static format(pounds: number, unit: WeightUnits = WeightUnits.Pound): string {
		return `${Int.from(Weight.fromPounds(pounds, unit))} ${unit}`
	}

	static fromString(text: string, defUnits: WeightUnits = WeightUnits.Pound): number {
		text = text.trim().replace(/^\++/, "")
		for (const unit of allWeightUnits) {
			if (text.endsWith(unit)) {
				const value = Int.fromString(text)
				return Weight.toPounds(value, unit)
			}
		}
		const value = Int.fromString(text)
		return Weight.toPounds(value, defUnits)
	}

	static toPounds(weight: number, unit: WeightUnits): number {
		switch (unit) {
			case WeightUnits.Pound:
			case WeightUnits.PoundAlt:
				return weight
			case WeightUnits.Ounce:
				return weight / 16
			case WeightUnits.Ton:
			case WeightUnits.TonAlt:
				return weight * 2000
			case WeightUnits.Kilogram:
				return weight * 2
			case WeightUnits.Gram:
				return weight / 500
			default:
				return Weight.toPounds(weight, WeightUnits.Pound)
		}
	}

	static fromPounds(weight: number, unit: WeightUnits): number {
		switch (unit) {
			case WeightUnits.Pound:
			case WeightUnits.PoundAlt:
				return weight
			case WeightUnits.Ounce:
				return weight * 16
			case WeightUnits.Ton:
			case WeightUnits.TonAlt:
				return weight / 2000
			case WeightUnits.Kilogram:
				return weight / 2
			case WeightUnits.Gram:
				return weight * 500
			default:
				return Weight.fromPounds(weight, WeightUnits.Pound)
		}
	}

	static trailingWeightUnitsFromString(s: string, defUnits: WeightUnits): WeightUnits {
		s = s.trim().toLowerCase()
		for (const one of allWeightUnits) {
			if (s.endsWith(one)) return one
		}
		return defUnits
	}
}

export enum WeightUnits {
	Pound = "lb",
	PoundAlt = "#",
	Ounce = "oz",
	Ton = "tn",
	TonAlt = "t",
	Kilogram = "kg",
	Gram = "g",
}

export const allWeightUnits = [
	WeightUnits.Pound,
	WeightUnits.PoundAlt,
	WeightUnits.Ounce,
	WeightUnits.Ton,
	WeightUnits.TonAlt,
	WeightUnits.Kilogram,
	WeightUnits.Gram,
]
