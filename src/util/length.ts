import { Int } from "./int.ts"

export namespace Length {
	export enum Unit {
		FeetAndInches = "ft_in",
		Inch = "in",
		Feet = "ft",
		Yard = "yd",
		Mile = "mi",
		Centimeter = "cm",
		Kilometer = "km",
		Meter = "m",
		AstronomicalUnit = "au",
		Lightyear = "ly",
		Parsec = "pc",
	}

	export const Units = [
		Unit.FeetAndInches,
		Unit.Inch,
		Unit.Feet,
		Unit.Yard,
		Unit.Mile,
		Unit.Centimeter,
		Unit.Kilometer,
		Unit.Meter,
		Unit.AstronomicalUnit,
		Unit.Lightyear,
		Unit.Parsec,
	]

	export const UnitChoices: Readonly<Record<Unit, string>> = Object.freeze({
		[Unit.FeetAndInches]: `GURPS.Enum.Length.${Unit.FeetAndInches}.Name`,
		[Unit.Inch]: `GURPS.Enum.Length.${Unit.Inch}.Name`,
		[Unit.Feet]: `GURPS.Enum.Length.${Unit.Feet}.Name`,
		[Unit.Yard]: `GURPS.Enum.Length.${Unit.Yard}.Name`,
		[Unit.Mile]: `GURPS.Enum.Length.${Unit.Mile}.Name`,
		[Unit.Centimeter]: `GURPS.Enum.Length.${Unit.Centimeter}.Name`,
		[Unit.Kilometer]: `GURPS.Enum.Length.${Unit.Kilometer}.Name`,
		[Unit.Meter]: `GURPS.Enum.Length.${Unit.Meter}.Name`,
		[Unit.AstronomicalUnit]: `GURPS.Enum.Length.${Unit.AstronomicalUnit}.Name`,
		[Unit.Lightyear]: `GURPS.Enum.Length.${Unit.Lightyear}.Name`,
		[Unit.Parsec]: `GURPS.Enum.Length.${Unit.Parsec}.Name`,
	})

	export const Symbols: Record<Unit, string[]> = {
		[Unit.FeetAndInches]: [],
		[Unit.Inch]: ["in", "inch", "inches"],
		[Unit.Feet]: ["ft", "foot", "feet"],
		[Unit.Yard]: ["yd", "yard", "yards"],
		[Unit.Mile]: ["mi", "mile", "miles"],
		[Unit.Centimeter]: ["cm", "centimeter", "centimeters", "centimetre", "centimetres"],
		[Unit.Kilometer]: ["km", "kilometer", "kilometers", "kilometre", "kilometres"],
		[Unit.Meter]: ["m", "meter", "meters", "metre", "metres"],
		[Unit.AstronomicalUnit]: ["au", "astronomical unit", "astronomical units"],
		[Unit.Lightyear]: ["ly", "lightyear", "lightyears"],
		[Unit.Parsec]: ["pc", "parsec", "parsecs"],
	}

	export function format(inches: number, unit: Unit): string {
		switch (unit) {
			case Unit.FeetAndInches: {
				const oneFoot = 12
				const feet = Math.trunc(inches / oneFoot)
				inches -= feet * oneFoot
				if (feet === 0 && inches === 0) {
					return "0'"
				}
				let buffer = ""
				if (feet > 0) buffer += `${feet.toString()}'`
				if (inches > 0) buffer += `${inches.toString()}"`
				return buffer
			}
			case Unit.Inch:
			case Unit.Feet:
			case Unit.Yard:
			case Unit.Meter:
			case Unit.Mile:
			case Unit.Centimeter:
			case Unit.Kilometer:
			case Unit.AstronomicalUnit:
			case Unit.Lightyear:
			case Unit.Parsec:
				return `${Math.round(fromInches(inches, unit) * 100) / 100} ${f(unit)}`
			default:
				return format(inches, Unit.FeetAndInches)
		}
	}

	export function fromString(text: string, defaultUnits: Unit): number {
		text = text.replace(/^\+/g, "")
		Units.forEach(unit => {
			if (text.endsWith(f(unit))) {
				const r = new RegExp(`${f(unit)}$`)
				const value = parseInt(text.replace(r, ""))
				return toInches(value, unit)
			}
			return toInches(Int.fromString(text)[0], Unit.Inch)
		})
		const feetIndex = text.indexOf("'")
		const inchIndex = text.indexOf('"')
		if (feetIndex === -1 && inchIndex === -1) {
			// Assume inches
			return toInches(parseInt(text), defaultUnits)
		}
		let feet = 0
		let inches = 0
		if (feetIndex !== -1) {
			const s = text.substring(0, feetIndex)
			feet = parseInt(s)
			if (!feet) return 0
		}
		if (inchIndex !== -1) {
			if (feetIndex > inchIndex) {
				console.error(`Invalid format: ${text}`)
				return 0
			}
			const s = text.substring(feetIndex + 1, inchIndex)
			inches = parseInt(s)
			if (!inches) return 0
		}
		return feet * 12 + inches
	}

	export function toInches(length: number, unit: Unit): number {
		switch (unit) {
			case Unit.FeetAndInches:
			case Unit.Inch:
				return length
			case Unit.Feet:
				return length * 12
			case Unit.Yard:
				return length * 36
			case Unit.Mile:
				return length * 63360
			case Unit.Centimeter:
				return length / 2.5
			case Unit.Kilometer:
				return length * 36000
			case Unit.Meter:
				return length * 36
			case Unit.AstronomicalUnit:
				// 93 million miles
				return length * 63360 * 93000000
			case Unit.Lightyear:
				// 5.865 trillion miles
				return length * 63360 * (5.865 * 10 ** 12)
			case Unit.Parsec:
				// 3.26 lightyears
				return length * 63360 * (3.26 * 5.865 * 10 ** 12)
			default:
				return toInches(length, Unit.FeetAndInches)
		}
	}

	export function fromInches(length: number, unit: Unit): number {
		switch (unit) {
			case Unit.FeetAndInches:
			case Unit.Inch:
				return length
			case Unit.Feet:
				return length / 12
			case Unit.Yard:
			case Unit.Meter:
				return length / 36
			case Unit.Mile:
				return length / 63360
			case Unit.Centimeter:
				return length * 2.5
			case Unit.Kilometer:
				return length / 36000
			case Unit.AstronomicalUnit:
				// 93 million miles
				return length / 63360 / 93000000
			case Unit.Lightyear:
				// 5.865 trillion miles
				return length / 63360 / (5.865 * 10 ** 12)
			case Unit.Parsec:
				// 3.26 lightyears
				return length / 63360 / (3.26 * 5.865 * 10 ** 12)
			default:
				return fromInches(length, Unit.Yard)
		}
	}

	export function f(u: Unit): string {
		return game.i18n.localize(`GURPS.Enum.Length.${u}.Name`)
	}
}
