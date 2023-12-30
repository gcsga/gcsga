import { WeaponSheet } from "@item/weapon/sheet"
import { RangedWeaponGURPS } from "./document"

export class RangedWeaponSheet extends WeaponSheet {
	declare object: RangedWeaponGURPS

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
		const groupedWeaponData: DeepPartial<Record<keyof RangedWeaponGURPS, Record<string, any>>> = Object.keys(
			weaponData
		).reduce((obj: DeepPartial<Record<keyof RangedWeaponGURPS, Record<string, any>>>, key: string) => {
			const [type, ...property] = key.split(".").slice(1) as [keyof RangedWeaponGURPS, string[]]
			obj[type] ??= {}
			obj[type]![property.join(".")] = weaponData[key]
			return obj
		}, {})
		for (const key of Object.keys(groupedWeaponData) as Array<keyof RangedWeaponGURPS>) {
			const property = this.object[key]
			if (key === "rate_of_fire") {
				const parts = key.split(".")
				if (parts.length > 1) {
					const subProperty = property[parts[0]]
					Object.assign(subProperty, { [parts[1]]: groupedWeaponData[key] })
					property[parts[0]] = subProperty
				} else {
					Object.assign(property, groupedWeaponData[key])
				}
			} else {
				Object.assign(property, groupedWeaponData[key])
			}
			if (key === "range") data[`system.${key}`] = property.toString(false)
			else data[`system.${key}`] = property.toString(false)
		}
		return data
	}
}
