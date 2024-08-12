import { ItemType, SYSTEM_NAME } from "@module/data/constants.ts"
import { ItemGURPS } from "./document.ts"

const ItemsWithoutNameables = [
	ItemType.LegacyItem,
	ItemType.Effect,
	ItemType.Condition,
	ItemType.MeleeWeapon,
	ItemType.RangedWeapon,
]

class ItemSubstitutionSheet<TItem extends ItemGURPS> extends DocumentSheet<TItem> {
	get item(): TItem {
		return this.document
	}

	get substitutionFields(): string[] {
		return this.item.substitutionFields
	}

	override getData(
		options?: Partial<DocumentSheetOptions> | undefined,
	): ItemSubstitutionSheetData<TItem> | Promise<ItemSubstitutionSheetData<TItem>> {
		return fu.mergeObject(super.getData(options), {
			substitutionEntries: this.getSubstitutionEntries(),
		}) as ItemSubstitutionSheetData<TItem>
	}

	override get template(): string {
		return `systems/${SYSTEM_NAME}/templates/item/substitution-sheet.hbs`
	}

	getSubstitutionEntries(): Record<string, string> {
		if (this.item.isOfType(...ItemsWithoutNameables)) return {}
		const substitutionEntries: Record<string, string> = {}
		for (const field of this.substitutionFields) {
			const value = fu.getProperty(this.item.system, field) as string
			const entries = [...value.matchAll(/@([^@]+)@/g)].map(e => e[1])
			for (const entry of entries) {
				// TODO: fix later
				// @ts-expect-error not properly defined
				substitutionEntries[entry] = this.item.system.replacements[entry] || `@${entry}@`
			}
		}
		return substitutionEntries
	}

	protected override async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
		event.preventDefault()
		this.item.update({ "system.replacements": formData })

		// const newFormData = this.substitutionFields.reduce((acc: Record<string, unknown>, key) => {
		// 	acc[key] = fu.getProperty(this.item.system, key)
		// 	return acc
		// }, {})
		// for (const [key, value] of Object.entries(newFormData) as [string, string][]) {
		// 	let newValue = value
		// 	const substitutionKeys = [...value.matchAll(/@([^@])@/g)].map(e => e[1])
		// 	for (const substitutionKey of substitutionKeys) {
		// 		const subRegex = new RegExp(`@${substitutionKey}@`)
		// 		const substitutedValue = (formData[key] as string) ?? `@${substitutionKey}@`
		// 		newValue = newValue.replaceAll(subRegex, substitutedValue)
		// 	}
		// 	newFormData[key] = newValue
		// }
		// this.item.update(newFormData)
	}
}

interface ItemSubstitutionSheetData<TItem extends ItemGURPS> extends DocumentSheetData<TItem> {
	substitutionEntries: Record<string, string>
}

export { ItemSubstitutionSheet }
