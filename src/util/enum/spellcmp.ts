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
			return `GURPS.Enum.spellcmp.${T}`
		}

		export function usesStringCriteria(T: Type): boolean {
			return [Type.Name, Type.Tag, Type.College].includes(T)
		}
	}

	export const Types: Type[] = [Type.Name, Type.Tag, Type.College, Type.CollegeCount, Type.Any]

	export const TypesChoices: Readonly<Record<Type, string>> = Object.freeze({
		[Type.Name]: Type.toString(Type.Name),
		[Type.Tag]: Type.toString(Type.Tag),
		[Type.College]: Type.toString(Type.College),
		[Type.CollegeCount]: Type.toString(Type.CollegeCount),
		[Type.Any]: Type.toString(Type.Any),
	})
}
