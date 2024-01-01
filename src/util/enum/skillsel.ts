import { LocalizeGURPS } from "@util/localize"

export enum skillsel {
	Name = "skills_with_name",
	ThisWeapon = "this_weapon",
	WeaponsWithName = "weapons_with_name",
}

export namespace skillsel {
	export function ensureValid(T: skillsel): skillsel {
		if (Types.includes(T)) return T
		return Types[0]
	}

	export function toString(T: skillsel): string {
		return LocalizeGURPS.translations.gurps.enum.skillsel[T]
	}
}

const Types: skillsel[] = [
	skillsel.Name,
	skillsel.ThisWeapon,
	skillsel.WeaponsWithName
]
