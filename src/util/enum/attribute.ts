import { equalFold } from "@module/util/string-criteria.ts"

export namespace attribute {
	export enum Type {
		Integer = "integer",
		IntegerRef = "integer_ref",
		Decimal = "decimal",
		DecimalRef = "decimal_ref",
		Pool = "pool",
		PoolRef = "pool_ref",
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
			return `GURPS.Enum.attribute.${T}`
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
		Type.PoolRef,
		Type.PrimarySeparator,
		Type.SecondarySeparator,
		Type.PoolSeparator,
	]

	export const TypesChoices: Readonly<Record<Type, string>> = Object.freeze({
		[Type.Integer]: Type.toString(Type.Integer),
		[Type.IntegerRef]: Type.toString(Type.IntegerRef),
		[Type.Decimal]: Type.toString(Type.Decimal),
		[Type.DecimalRef]: Type.toString(Type.DecimalRef),
		[Type.Pool]: Type.toString(Type.Pool),
		[Type.PoolRef]: Type.toString(Type.PoolRef),
		[Type.PrimarySeparator]: Type.toString(Type.PrimarySeparator),
		[Type.SecondarySeparator]: Type.toString(Type.SecondarySeparator),
		[Type.PoolSeparator]: Type.toString(Type.PoolSeparator),
	})
}
