import { LocalizeGURPS } from "@util/localize.ts"
import { equalFold } from "@module/util/string-criteria.ts"

export namespace attribute {
	export enum Type {
		Integer = "integer",
		IntegerRef = "integer_ref",
		Decimal = "decimal",
		DecimalRef = "decimal_ref",
		Pool = "pool",
		PrimarySeparator = "primary_separator",
		SecondarySeparator = "secondary_separator",
		PoolSeparator = "pool_separator",
	}

	export namespace Type {
		export function LastType(): Type {
			return Type.PoolSeparator
		}

		export function index(T: Type): number {
			return Types.indexOf(T)
		}

		export function ensureValid(T: Type): Type {
			if (index(T) <= Types.length) return T
			return Types[0]
		}

		export function toString(T: Type): string {
			return LocalizeGURPS.translations.gurps.enum.attribute[T]
		}

		export function extractType(s: string): Type {
			for (const one of Types) {
				if (equalFold(one, s)) return one
			}
			return Types[0]
		}
	}

	export const Types: Type[] = [
		Type.Integer,
		Type.IntegerRef,
		Type.Decimal,
		Type.DecimalRef,
		Type.Pool,
		Type.PrimarySeparator,
		Type.SecondarySeparator,
		Type.PoolSeparator,
	]
}
