import { ItemGURPS2 } from "@module/document/item.ts"
import { ItemTemplateType } from "../item/types.ts"
import { ContainerTemplate } from "../item/templates/container.ts"

export class ItemsGURPS extends Items<ItemGURPS2<null>> {
	override _getVisibleTreeContents(): ItemGURPS2<null>[] {
		return this.contents.filter(
			e => !e.hasTemplate(ItemTemplateType.BasicInformation) || !this.has(e.system.container ?? ""),
		)
	}

	override async importFromCompendium(
		pack: CompendiumCollection<ItemGURPS2<null>>,
		id: string,
		updateData?: Record<string, unknown> | undefined,
		operation?: Partial<DatabaseCreateOperation<null>> | undefined,
	): Promise<ItemGURPS2<null> | null> {
		const created = (await super.importFromCompendium(pack, id, updateData, operation)) as ItemGURPS2<null> & {
			system: ContainerTemplate
		}

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
							item as ItemGURPS2<null> | ItemGURPS2["_source"],
							fromOptions,
						) as ItemGURPS2<null>["_source"],
				})
				await ItemGURPS2.createDocuments(toCreate, { fromCompendium: true, keepId: true })
			}
		}
		return created
	}
}
