import { LocalizeGURPS } from "@util/localize"
import { equalFold } from "@util/string_criteria"

export namespace tmcost {
	export enum Type {
		Percentage = "percentage",
		Points = "points",
		Multiplier = "multiplier",
	}

	export namespace Type {
		export function LastType(): Type {
			return Type.Multiplier
		}

		export function toString(T: Type): string {
			return LocalizeGURPS.translations.gurps.enum.tmcost[T]
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

	export const Types: Type[] = [Type.Percentage, Type.Points, Type.Multiplier]
}
