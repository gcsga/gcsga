import { Fraction } from "@util/fxp"
import { LocalizeGURPS } from "@util/localize"
import { equalFold } from "@util/misc"

export namespace emweight {

	export enum Type {
		Original = "to_original_weight",
		Base = "to_base_weight",
		FinalBase = "to_final_base_weight",
		Final = "to_final_weight",
	}

	export namespace Type {

		export function LastType(): Type { return Type.Final }

		export function permitted(T: Type): Value[] {
			if (Type.ensureValid(T) === Type.Original) return [Value.Addition, Value.PercentageAdder]
			return [Value.Addition, Value.PercentageAdder, Value.Multiplier]
		}


		export function determineModifierWeightValueTypeFromString(T: Type, s: string): Value {
			const mvt = Value.fromString(s)
			const permitted = Type.permitted(T)
			for (const one of permitted) {
				if (one === mvt) return mvt
			}
			return permitted[0]
		}

		export function toString(T: Type): string {
			switch (T) {
				case Type.Original:
				case Type.Base:
				case Type.FinalBase:
				case Type.Final:
					return LocalizeGURPS.translations.gurps.enum.emweight.type.string[T]
				default:
					return Types[0].toString()
			}
		}

		export function altString(T: Type): string {
			switch (T) {
				case Type.Original:
				case Type.Base:
				case Type.FinalBase:
				case Type.Final:
					return LocalizeGURPS.translations.gurps.enum.emweight.type.alt_string[T]
				default:
					return Types[0].toString()
			}
		}

		export function stringWithExample(T: Type): string {
			return `${Type.toString(T)} (e.g. ${Type.altString(T)})`
		}

		export function ensureValid(T: Type): Type {
			if (Types.includes(T)) return T
			return Types[0]
		}


		export function extractType(s: string): Type {
			for (const one of Types) {
				if (equalFold(one, s)) return one
			}
			return Types[0]
		}
	}

	export const Types: Type[] = [
		Type.Original,
		Type.Base,
		Type.FinalBase,
		Type.Final
	]

	export enum Value {
		Addition = "+",
		PercentageAdder = "%",
		PercentageMultiplier = "x%",
		Multiplier = "x",
	}

	export namespace Value {

		export function LastValue(): Value { return Value.Multiplier }

		export function ensureValid(V: Value): Value {
			if (Values.includes(V)) return V
			return Values[0]
		}

		export function extractFraction(V: Value, s: string): Fraction {
			s = s.trim().replace(/^x*/, "")
			while (s.length > 0 && !s?.at(-1)?.match(/\d/)) {
				s = s.substring(0, s.length - 1)
			}
			const fraction = Fraction.new(s)
			if (V === Value.PercentageMultiplier) {
				if (fraction.numerator <= 0) {
					fraction.numerator = 100
					fraction.denominator = 1
				}
			} else if (V === Value.Multiplier) {
				if (fraction.numerator <= 0) {
					fraction.numerator = 1
					fraction.denominator = 1
				}
			}
			return fraction
		}

		export function fromString(s: string): Value {
			s = s.trim().toLowerCase()
			switch (true) {
				case s.endsWith("%"):
					if (s.startsWith("x")) return Value.PercentageMultiplier
					return Value.PercentageAdder
				case s.startsWith("x") || s.endsWith("x"):
					return Value.Multiplier
				default:
					return Value.Addition
			}
		}


		export function extractValue(s: string): Value {
			for (const one of Values) {
				if (equalFold(one, s)) return one
			}
			return Values[0]
		}
	}

	export const Values: Value[] = [
		Value.Addition,
		Value.PercentageAdder,
		Value.PercentageMultiplier,
		Value.Multiplier
	]
}
