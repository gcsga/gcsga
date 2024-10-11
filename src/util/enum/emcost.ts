import { equalFold } from "@module/data/item/components/string-criteria.ts"
import { Int } from "@util/int.ts"

export namespace emcost {
	export enum Type {
		Original = "to_original_cost",
		Base = "to_base_cost",
		FinalBase = "to_final_base_cost",
		Final = "to_final_cost",
	}

	export namespace Type {
		export function permitted(T: Type): Value[] {
			if (Type.ensureValid(T) === Type.Base) return [Value.CostFactor, Value.Multiplier]
			return [Value.Addition, Value.Percentage, Value.Multiplier]
		}

		export function determineModifierCostValueTypeFromString(T: Type, s: string): Value {
			const mvt = Value.fromString(s)
			const permitted = Type.permitted(T)
			for (const one of permitted) {
				if (one === mvt) return mvt
			}
			return permitted[0]
		}

		export function toString(T: Type): string {
			return `GURPS.Enum.emcost.Type.${T}.Name`
		}

		export function altString(T: Type): string {
			return `GURPS.Enum.emcost.Type.${T}.Alt`
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

		export function fromString(T: Type, s: string): Value {
			const cvt = Value.fromString(s)
			const permitted = Type.permitted(T)
			for (const one of permitted) {
				if (one === cvt) return cvt
			}
			return permitted[0]
		}

		export function format(T: Type, s: string): string {
			const cvt = fromString(T, s)
			return Value.format(cvt, Value.extractValue(cvt, s))
		}
	}

	export const Types: Type[] = [Type.Original, Type.Base, Type.FinalBase, Type.Final]

	export const TypesChoices: Readonly<Record<Type, string>> = Object.freeze({
		[Type.Original]: Type.toString(Type.Original),
		[Type.Base]: Type.toString(Type.Base),
		[Type.FinalBase]: Type.toString(Type.FinalBase),
		[Type.Final]: Type.toString(Type.Final),
	})

	export enum Value {
		Addition = "+",
		Percentage = "%",
		Multiplier = "x",
		CostFactor = "cf",
	}

	export namespace Value {
		export function LastValue(): Value {
			return Value.CostFactor
		}

		export function ensureValid(V: Value): Value {
			if (Values.includes(V)) return V
			return Values[0]
		}

		export function toString(V: Value): string {
			return `GURPS.Enum.emcost.Value.${V}.Name`
		}

		export function format(V: Value, value: number): string {
			switch (V) {
				case Value.Addition:
					return value.signedString()
				case Value.Percentage:
					return value.signedString() + Value.toString(V)
				case Value.Multiplier:
					if (value <= 0) value = 1
					return Value.toString(V) + value.toString()
				case Value.CostFactor:
					return `${value.signedString()} ${Value.toString(V)}`
				default:
					return Value.format(Value.Addition, value)
			}
		}

		export function fromString(s: string): Value {
			s = s.trim().toLowerCase()
			switch (true) {
				case s.endsWith(Value.CostFactor):
					return Value.CostFactor
				case s.endsWith(Value.Percentage):
					return Value.Percentage
				case s.endsWith(Value.Multiplier) || s.startsWith(Value.Multiplier):
					return Value.Multiplier
				default:
					return Value.Addition
			}
		}

		export function extractValue(V: Value, s: string): number {
			let [v] = Int.extract(s.trim().replace(new RegExp(`^${Value.Multiplier}+`), ""))
			if (Value.ensureValid(V) === Value.Multiplier && v <= 0) v = 1
			return v
		}
	}

	export const Values: Value[] = [Value.Addition, Value.Percentage, Value.Multiplier, Value.CostFactor]
}
