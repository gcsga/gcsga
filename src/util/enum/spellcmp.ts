import { LocalizeGURPS } from "@util/localize"

export namespace spellcmp {
	export enum Type {
		Name = "name",
		Tag = "tag",
		College = "college",
		CollegeCount = "college_count",
		Any = "any",
	}

	export namespace Type {
		export function toString(T: Type): string {
			return LocalizeGURPS.translations.gurps.enum.spellcmp[T]
		}

		export function usesStringCriteria(T: Type): boolean {
			return [Type.Name, Type.Tag, Type.College].includes(T)
		}
	}

	export const Types: Type[] = [Type.Name, Type.Tag, Type.College, Type.CollegeCount, Type.Any]
}
