import { WeaponSheet } from "@item/weapon/sheet"
import { MeleeWeaponGURPS } from "./document"

export class MeleeWeaponSheet extends WeaponSheet {
	declare object: MeleeWeaponGURPS

	protected _processWeaponFieldChanges(data: Record<string, any>): Record<string, any> {
		const weaponData = Object.keys(data)
			.filter(key => key.startsWith("weapon."))
			.reduce(
				(obj, key) => {
					obj[key] = data[key]
					return obj
				},
				<Record<string, any>>{}
			)
		for (const key of Object.keys(weaponData)) delete data[key]
		const groupedWeaponData: DeepPartial<Record<keyof MeleeWeaponGURPS, Record<string, any>>> = Object.keys(
			weaponData
		).reduce((obj: DeepPartial<Record<keyof MeleeWeaponGURPS, Record<string, any>>>, key: string) => {
			const [type, ...property] = key.split(".").slice(1) as [keyof MeleeWeaponGURPS, string[]]
			obj[type] ??= {}
			if (property.join(".") === "no") obj[type]![property.join(".")] = !weaponData[key]
			else obj[type]![property.join(".")] = weaponData[key]
			return obj
		}, {})
		for (const key of Object.keys(groupedWeaponData) as Array<keyof MeleeWeaponGURPS>) {
			const property = this.object[key]
			Object.assign(property, groupedWeaponData[key])
			data[`system.${key}`] = property.toString(false)
		}
		return data
	}
}
