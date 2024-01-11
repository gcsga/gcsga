import { LocalizeGURPS } from "@util/localize"

export namespace spellmatch {
	export enum Type {
		AllColleges = "all_colleges",
		CollegeName = "college_name",
		PowerSource = "power_source_name",
		Name = "spell_name",
	}

	export namespace Type {
		export interface Matcher {
			matches: (s: string) => boolean
			matchesList: (...s: string[]) => boolean
		}

		export function toString(T: Type): string {
			return LocalizeGURPS.translations.gurps.enum.spellmatch[T]
		}

		export function matchForType(
			T: Type,
			matcher: Matcher,
			name: string,
			powerSource: string,
			colleges: string[]
		): boolean {
			switch (T) {
				case Type.AllColleges:
					return true
				case Type.CollegeName:
					return matcher.matchesList(...colleges)
				case Type.PowerSource:
					return matcher.matches(powerSource)
				case Type.Name:
					return matcher.matches(name)
			}
		}
	}

	export const Types: Type[] = [Type.AllColleges, Type.CollegeName, Type.PowerSource, Type.Name]
}
