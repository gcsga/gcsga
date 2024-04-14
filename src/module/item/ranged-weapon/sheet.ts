import { SYSTEM_NAME } from "@module/data/constants.ts"
import { RangedWeaponGURPS } from "./document.ts"
import { ItemSheetDataGURPS, ItemSheetGURPS, ItemSheetOptions } from "@item/base/sheet.ts"
import { WeaponField } from "@item/abstract-weapon/weapon-field.ts"
import { WeaponROF } from "@item/abstract-weapon/weapon-rof.ts"

class RangedWeaponSheetGURPS extends ItemSheetGURPS<RangedWeaponGURPS> {
	override get template(): string {
		return `systems/${SYSTEM_NAME}/templates/item/ranged-weapon/sheet.hbs`
	}

	override async getData(options?: Partial<ItemSheetOptions>): Promise<RangedWeaponSheetData> {
		const sheetData = await super.getData(options)

		return {
			...sheetData,
			sysPrefix: "array.system.",
		}
	}

	protected override async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
		formData = this._processWeaponFieldChanges(formData)
		return super._updateObject(event, formData)
	}

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
			const property = (this.object[key] as WeaponField) ?? {}
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
interface RangedWeaponSheetData extends ItemSheetDataGURPS<RangedWeaponGURPS> {
	sysPrefix: string
}

export { RangedWeaponSheetGURPS }
