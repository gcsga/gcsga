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
			return `GURPS.Enum.wsel.${T}`
		}
	}
	export const Types: Type[] = [Type.WithRequiredSkill, Type.ThisWeapon, Type.WithName]

	export const TypesChoices: Readonly<Record<Type, string>> = Object.freeze(
		Object.fromEntries(Types.map(T => [T, Type.toString(T)])) as Record<Type, string>,
	)
}
