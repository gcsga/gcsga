import { LocalizeGURPS } from "@util/localize.ts"

export namespace wsel {
	export enum Type {
		WithRequiredSkill = "weapons_with_required_skill",
		ThisWeapon = "this_weapon",
		WithName = "weapons_with_name",
	}

	export namespace Type {
		export function ensureValid(T: Type): Type {
			if (Types.includes(T)) return T
			return Types[0]
		}

		export function toString(T: Type): string {
			return LocalizeGURPS.translations.gurps.enum.wsel[T]
		}
	}
	export const Types: Type[] = [Type.WithRequiredSkill, Type.ThisWeapon, Type.WithName]
}
