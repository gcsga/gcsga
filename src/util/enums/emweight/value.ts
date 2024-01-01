import { Fraction } from "@util/fxp"

export enum emweight {
	Addition = "+",
	PercentageAdder = "%",
	PercentageMultiplier = "x%",
	Multiplier = "x",
}

export function format(type: emweight, fraction: Fraction): string {
	switch (type) {
		case emweight.Addition:
			return fraction.signedString()
		case emweight.PercentageAdder:
			return fraction.signedString() + type
		case emweight.PercentageMultiplier:
			if (fraction.numerator <= 0) {
				fraction.numerator = 100
				fraction.denominator = 1
			}
			return emweight.Multiplier + fraction.toString() + emweight.PercentageAdder
		case emweight.Multiplier:
			if (fraction.numerator <= 0) {
				fraction.numerator = 1
				fraction.denominator = 1
			}
			return type + fraction.toString()
		default:
			return format(emweight.Addition, fraction)
	}
}

export function extractFraction(type: emweight, s: string): Fraction {
	s = s.trim().replace(/^x*/, "")
	while (s.length > 0 && !s?.at(-1)?.match(/\d/)) {
		s = s.substring(0, s.length - 1)
	}
	const fraction = Fraction.new(s)
	if (type === emweight.PercentageMultiplier) {
		if (fraction.numerator <= 0) {
			fraction.numerator = 100
			fraction.denominator = 1
		}
	} else if (type === emweight.Multiplier) {
		if (fraction.numerator <= 0) {
			fraction.numerator = 1
			fraction.denominator = 1
		}
	}
	return fraction
}

export function fromString(s: string): emweight {
	s = s.trim().toLowerCase()
	switch (true) {
		case s.endsWith("%"):
			if (s.startsWith("x")) return emweight.PercentageMultiplier
			return emweight.PercentageAdder
		case s.startsWith("x") || s.endsWith("x"):
			return emweight.Multiplier
		default:
			return emweight.Addition
	}
}
