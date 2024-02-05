import { WeaponSheet } from "@item/weapon/sheet.ts"
import { MeleeWeaponGURPS } from "./document.ts"
import { WeaponField } from "@item/weapon/weapon_field.ts"

export class MeleeWeaponSheet<IType extends MeleeWeaponGURPS = MeleeWeaponGURPS> extends WeaponSheet<IType> {
	protected _processWeaponFieldChanges(data: Record<string, unknown>): Record<string, unknown> {
		const weaponData = Object.keys(data)
			.filter(key => key.startsWith("weapon."))
			.reduce(
				(obj, key) => {
					obj[key] = data[key]
					return obj
				},
				<Record<string, unknown>>{},
			)
		for (const key of Object.keys(weaponData)) delete data[key]
		const groupedWeaponData: DeepPartial<Record<keyof MeleeWeaponGURPS, Record<string, unknown>>> = Object.keys(
			weaponData,
		).reduce((obj: DeepPartial<Record<keyof MeleeWeaponGURPS, Record<string, unknown>>>, key: string) => {
			const [type, ...property] = key.split(".").slice(1) as [keyof MeleeWeaponGURPS, string[]]
			obj[type] ??= {}
			if (property.join(".") === "no") obj[type]![property.join(".")] = !weaponData[key]
			else obj[type]![property.join(".")] = weaponData[key]
			return obj
		}, {})
		for (const key of Object.keys(groupedWeaponData) as (keyof MeleeWeaponGURPS)[]) {
			const property = this.object[key] as WeaponField
			Object.assign(property, groupedWeaponData[key])
			data[`system.${key}`] = property.toString()
		}
		return data
	}
}
