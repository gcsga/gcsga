import { ItemGURPS2 } from "@module/documents/item.ts"
import { ItemTemplateType } from "../item/types.ts"
import { ItemTemplateInst } from "../item/helpers.ts"
import { SYSTEM_NAME } from "../constants.ts"

class ItemsGURPS<TItem extends ItemGURPS2<null>> extends Items<TItem> {
	static entryPartial = `systems/${SYSTEM_NAME}/templates/sidebar/partials/item-partial.hbs`

	override _getVisibleTreeContents(): TItem[] {
		return this.contents.filter(
			e =>
				e.visible && (!e.hasTemplate(ItemTemplateType.BasicInformation) || !this.has(e.system.container ?? "")),
		)
	}

	override async importFromCompendium(
		pack: CompendiumCollection<TItem>,
		id: string,
		updateData?: Record<string, unknown> | undefined,
		operation?: Partial<DatabaseCreateOperation<null>> | undefined,
	): Promise<TItem> {
		const created = (await super.importFromCompendium(
			pack,
			id,
			updateData,
			operation,
		)) as ItemTemplateInst<ItemTemplateType.Container> | null

		const item = await pack.getDocument(id)
		if (item?.hasTemplate(ItemTemplateType.Container)) {
			const contents = await item.system.contents
			if (contents) {
				const fromOptions = fu.mergeObject({ clearSort: false }, operation)
				const toCreate = await ItemGURPS2.createWithContents(contents, {
					container: created,
					keepId: operation?.keepId ?? false,
					transformAll: (item: ItemGURPS2 | ItemGURPS2["_source"]) =>
						this.fromCompendium(
							item as TItem | TItem["_source"],
							fromOptions,
						) as ItemGURPS2<null>["_source"],
				})
				await ItemGURPS2.createDocuments(toCreate, { fromCompendium: true, keepId: true })
			}
		}
		return created as unknown as TItem
	}
}

interface ItemsGURPS<TItem extends ItemGURPS2<null>> extends Items<TItem> {
	// constructor: typeof ItemsGURPS
}

export { ItemsGURPS }
