import { SYSTEM_NAME } from "@module/data/constants.ts"
import { ItemGURPS } from "../item/base/document.ts"

// interface NameableFiller {
// 	fillWithNameableKeys(m: Map<string, string>, existing?: Map<string, string>): void
// }
//
// interface NameableAccesser {
// 	get nameableReplacements(): Map<string, string>
// }

// interface NameableApplier extends NameableAccesser, NameableFiller {
// 	applyNameableKeys(m: Map<string, string>): void
// }

export namespace Nameable {
	export function extract(str: string, m: Map<string, string>, existing: Map<string, string>): void {
		for (const key of [...str.matchAll(/@([^@]+)@/g)].map(e => e[1])) {
			if (existing.has(key)) m.set(key, existing.get(key)!)
			else m.set(key, key)
		}
	}

	export function apply(str: string, m: Map<string, string>): string {
		for (const [key, value] of m.entries()) {
			str = str.replaceAll(`@${key}@`, value)
		}
		return str
	}

	export function applyToList(inputList: string[], m: Map<string, string>): string[] {
		if (inputList.length === 0) return []
		const list: string[] = new Array(inputList.length)
		for (let i = 0; i < list.length; i++) {
			list[i] = apply(inputList[i], m)
		}
		return list
	}

	export function reduce(needed: Map<string, string>, replacements: Map<string, string>): Map<string, string> {
		const ret = new Map()
		for (const [key, value] of replacements.entries()) {
			if (needed.has(key)) ret.set(key, value)
		}
		return ret
	}
}

class ItemSubstitutionSheet<TItem extends ItemGURPS> extends DocumentSheet<TItem> {
	get item(): TItem {
		return this.document
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
		return Object.fromEntries(this.item.nameableReplacements)
	}

	protected override async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
		event.preventDefault()
		this.item.update({ "system.replacements": formData })
	}
}

interface ItemSubstitutionSheetData<TItem extends ItemGURPS> extends DocumentSheetData<TItem> {
	substitutionEntries: Record<string, string>
}

export { ItemSubstitutionSheet }
