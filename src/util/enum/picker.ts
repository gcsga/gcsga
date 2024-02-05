import { LocalizeGURPS } from "@util/localize.ts"

export namespace picker {
	export enum Type {
		NotApplicable = "not_applicable",
		Count = "count",
		Points = "points",
	}

	export namespace Type {
		export function toString(T: Type): string {
			return LocalizeGURPS.translations.gurps.enum.picker[T]
		}
	}

	export const Types: Type[] = [Type.NotApplicable, Type.Count, Type.Points]
}
