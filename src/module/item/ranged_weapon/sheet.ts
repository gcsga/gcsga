import { WeaponSheet } from "@item/weapon/sheet.ts"
import { RangedWeaponGURPS } from "./document.ts"
import { WeaponField } from "@item/weapon/weapon_field.ts"
import { WeaponROF } from "@item/weapon/weapon_rof.ts"

export class RangedWeaponSheet<IType extends RangedWeaponGURPS = RangedWeaponGURPS> extends WeaponSheet<IType> {
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
		const groupedWeaponData: DeepPartial<Record<keyof RangedWeaponGURPS, Record<string, unknown>>> = Object.keys(
			weaponData,
		).reduce((obj: DeepPartial<Record<keyof RangedWeaponGURPS, Record<string, unknown>>>, key: string) => {
			const [type, ...property] = key.split(".").slice(1) as [keyof RangedWeaponGURPS, string[]]
			obj[type] ??= {}
			obj[type]![property.join(".")] = weaponData[key]
			return obj
		}, {})
		for (const key of Object.keys(groupedWeaponData) as (keyof RangedWeaponGURPS)[]) {
			const property = this.object[key] as WeaponField
			if (key === "rate_of_fire") {
				const parts = key.split(".") as ("mode1" | "mode2")[]
				if (parts.length > 1) {
					const subProperty = (property as WeaponROF)[parts[0]]
					Object.assign(subProperty, { [parts[1]]: groupedWeaponData[key] })
					;(property as WeaponROF)[parts[0]] = subProperty
				} else {
					Object.assign(property, groupedWeaponData[key])
				}
			} else {
				Object.assign(property, groupedWeaponData[key])
			}
			if (key === "range") data[`system.${key}`] = property.toString()
			else data[`system.${key}`] = property.toString()
		}
		return data
	}
}
