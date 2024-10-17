export namespace tmcost {
	export enum Type {
		Percentage = "percentage",
		Points = "points",
		Multiplier = "multiplier",
	}

	export namespace Type {
		export function toString(T: Type): string {
			return `GURPS.Enum.tmcost.${T}.Name`
		}
	}

	export const Types: Type[] = [Type.Percentage, Type.Points, Type.Multiplier]

	export const TypesChoices: Readonly<Record<Type, string>> = Object.freeze({
		[Type.Percentage]: Type.toString(Type.Percentage),
		[Type.Points]: Type.toString(Type.Points),
		[Type.Multiplier]: Type.toString(Type.Multiplier),
	})
}
