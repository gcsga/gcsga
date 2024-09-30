export namespace spellmatch {
	export enum Type {
		AllColleges = "all_colleges",
		CollegeName = "college_name",
		PowerSource = "power_source_name",
		Name = "spell_name",
	}

	export namespace Type {
		export interface Matcher {
			matches: (replacements: Map<string, string>, value: string) => boolean
			matchesList: (replacements: Map<string, string>, ...values: string[]) => boolean
		}

		export function toString(T: Type): string {
			return `GURPS.Enum.spellmatch.${T}`
		}

		export function matchForType(
			T: Type,
			replacements: Map<string, string>,
			matcher: Matcher,
			name: string,
			powerSource: string,
			colleges: string[],
		): boolean {
			switch (T) {
				case Type.AllColleges:
					return true
				case Type.CollegeName:
					return matcher.matchesList(replacements, ...colleges)
				case Type.PowerSource:
					return matcher.matches(replacements, powerSource)
				case Type.Name:
					return matcher.matches(replacements, name)
			}
		}
	}

	export const Types: Type[] = [Type.AllColleges, Type.CollegeName, Type.PowerSource, Type.Name]

	export const TypesChoices: Readonly<Record<Type, string>> = Object.freeze(
		Object.fromEntries(Types.map(T => [T, Type.toString(T)])) as Record<Type, string>,
	)
}
