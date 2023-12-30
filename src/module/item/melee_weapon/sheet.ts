import { WeaponSheet } from "@item/weapon/sheet"

export class MeleeWeaponSheet extends WeaponSheet {
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
		console.log(weaponData)

		return data
	}
}
