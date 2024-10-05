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

	export namespace Type {
		export function index(T: Type): number {
			return Types.indexOf(T)
		}

		export function toString(T: Type): string {
			return `GURPS.Enum.attribute.Type.${T}`
		}
	}

	export enum Placement {
		Automatic = "automatic",
		Primary = "primary",
		Secondary = "secondary",
		Hidden = "hidden",
	}

	export const Placements: Placement[] = [
		Placement.Automatic,
		Placement.Primary,
		Placement.Secondary,
		Placement.Hidden,
	]

	export namespace Placement {
		export function index(P: Placement): number {
			return Placements.indexOf(P)
		}

		export function toString(P: Placement): string {
			return `GURPS.Enum.attribute.Placement.${P}`
		}
	}

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

	export const PlacementsChoices: Readonly<Record<Placement, string>> = Object.freeze({
		[Placement.Automatic]: Placement.toString(Placement.Automatic),
		[Placement.Primary]: Placement.toString(Placement.Primary),
		[Placement.Secondary]: Placement.toString(Placement.Secondary),
		[Placement.Hidden]: Placement.toString(Placement.Hidden),
	})
}
