import { SYSTEM_NAME } from "@module/data/constants.ts"
import { MeleeWeaponGURPS } from "./document.ts"
import { ItemSheetDataGURPS, ItemSheetGURPS, ItemSheetOptions } from "@item/base/sheet.ts"
import { WeaponField } from "@item/abstract-weapon/weapon-field.ts"

class MeleeWeaponSheetGURPS extends ItemSheetGURPS<MeleeWeaponGURPS> {
	override get template(): string {
		return `systems/${SYSTEM_NAME}/templates/item/melee-weapon/sheet.hbs`
	}

	override async getData(options?: Partial<ItemSheetOptions>): Promise<MeleeWeaponSheetData> {
		const sheetData = await super.getData(options)

		return {
			...sheetData,
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
interface MeleeWeaponSheetData extends ItemSheetDataGURPS<MeleeWeaponGURPS> {}

export { MeleeWeaponSheetGURPS }
