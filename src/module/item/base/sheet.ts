import { ItemGURPS } from "./document.ts"

class ItemSheetGURPS<TItem extends ItemGURPS> extends ItemSheet<TItem, ItemSheetOptions> {
	static override get defaultOptions(): ItemSheetOptions {
		const options = super.defaultOptions
		return {
			...options,
		}
	}
}
interface ItemSheetDataGURPS<TItem extends ItemGURPS> extends ItemSheetData<TItem> {}

interface ItemSheetOptions extends DocumentSheetOptions {}

export { ItemSheetGURPS }
export type { ItemSheetDataGURPS, ItemSheetOptions }
