import { LocalizeGURPS } from "@util/localize"

export enum wsel {
	WithRequiredSkill = "weapons_with_required_skill",
	ThisWeapon = "this_weapon",
	WithName = "weapons_with_name",
}

export namespace wsel {

	export function ensureValid(T: wsel): wsel {
		if (Types.includes(T)) return T
		return Types[0]
	}

	export function toString(T: wsel): string {
		return LocalizeGURPS.translations.gurps.enum.wsel[T]
	}
}

const Types: wsel[] = [
	wsel.WithRequiredSkill,
	wsel.ThisWeapon,
	wsel.WithName
]
