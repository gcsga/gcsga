import { LocalizeGURPS } from "@util/localize"

export namespace skillsel {
	export enum Type {
		Name = "skills_with_name",
		ThisWeapon = "this_weapon",
		WeaponsWithName = "weapons_with_name",
	}

	export namespace Type {
		export function ensureValid(T: Type): Type {
			if (Types.includes(T)) return T
			return Types[0]
		}

		export function toString(T: Type): string {
			return LocalizeGURPS.translations.gurps.enum.skillsel[T]
		}
	}

	export const Types: Type[] = [Type.Name, Type.ThisWeapon, Type.WeaponsWithName]
}
