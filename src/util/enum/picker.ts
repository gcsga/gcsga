export namespace picker {
	export enum Type {
		NotApplicable = "not_applicable",
		Count = "count",
		Points = "points",
	}

	export namespace Type {
		export function toString(T: Type): string {
			return game.i18n.localize(`GURPS.Enum.picker.${T}.Name`)
		}
	}

	export const Types: Type[] = [Type.NotApplicable, Type.Count, Type.Points]
}
