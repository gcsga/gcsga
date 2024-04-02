import { ItemGURPS } from "@item"

export class ItemsGURPS<TItem extends ItemGURPS<null> = ItemGURPS<null>> extends Items<TItem> {
	// protected override _onUpdateDocuments(
	// 	documents: TItem[],
	// 	result: TItem["_source"][],
	// 	options: DocumentModificationContext<null>,
	// 	userId: string,
	// ): void {
	// 	super._onUpdateDocuments(documents, result, options, userId)
	// 	for (const document of documents) {
	// 		document.prepareSiblingData()
	// 	}
	// }
}
