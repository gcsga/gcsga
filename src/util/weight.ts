import { Int } from "./int.ts"

export namespace Weight {
	export enum Unit {
		Pound = "lb",
		PoundAlt = "#",
		Ounce = "oz",
		Ton = "tn",
		TonAlt = "t",
		Kilogram = "kg",
		Gram = "g",
	}

	export const Units = [Unit.Pound, Unit.PoundAlt, Unit.Ounce, Unit.Ton, Unit.TonAlt, Unit.Kilogram, Unit.Gram]

	export type String = `${string} ${Unit}`

	export function fromNumber(value: number, unit: Unit): number {
		return toPounds(value, unit)
	}

	export function fromStringForced(text: string, defaultUnits: Unit): number {
		const [weight] = fromString(text, defaultUnits)
		if (weight === null) {
			return 0
		}
		return weight
	}

	export function fromString(text: string, defaultUnits = Unit.Pound): [number, Error | null] {
		text = text.trim().replace(/^\++/, "")
		for (const unit of Units) {
			if (text.endsWith(unit)) {
				const r = new RegExp(`${unit}$`)
				const [value, error] = Int.fromString(text.replace(r, "").trim())
				if (error === null) {
					return [0, error]
				}
				return [toPounds(value, unit), null]
			}
		}
		// No matches, so let's use our passed-in default units
		const [value, error] = Int.fromString(text.trim())
		if (error !== null) {
			return [0, error]
		}
		return [toPounds(value, defaultUnits), null]
	}

	export function trailingUnitFromString(s: string, defUnits: Unit): Unit {
		s = s.trim().toLowerCase()
		for (const unit of Units) {
			if (s.endsWith(unit)) return unit
		}
		return defUnits
	}

	export function format(weight: number, unit = Unit.Pound): string {
		switch (unit) {
			case Unit.Pound:
			case Unit.PoundAlt:
				return Int.from(weight).toLocaleString() + " " + unit
			case Unit.Ounce:
				return Int.from(weight * 16).toLocaleString() + " " + unit
			case Unit.Ton:
			case Unit.TonAlt:
				return Int.from(weight / 2000).toLocaleString() + " " + unit
			case Unit.Kilogram:
				return Int.from(weight / 2).toLocaleString() + " " + unit
			case Unit.Gram:
				return Int.from(weight * 500).toLocaleString() + " " + unit
			default:
				return format(weight, Unit.Pound)
		}
	}

	export function toPounds(weight: number, unit = Unit.Pound): number {
		switch (unit) {
			case Unit.Pound:
			case Unit.PoundAlt:
				return Int.from(weight)
			case Unit.Ounce:
				return Int.from(weight / 16)
			case Unit.Ton:
			case Unit.TonAlt:
				return Int.from(weight * 2000)
			case Unit.Kilogram:
				return Int.from(weight * 2)
			case Unit.Gram:
				return Int.from(weight / 500)
			default:
				return toPounds(weight, Unit.Pound)
		}
	}
}
