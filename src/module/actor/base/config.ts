import { SYSTEM_NAME } from "@module/data/index.ts"
import { Document } from "types/foundry/common/abstract/module.js"

class DocumentSheetConfigGURPS<TDocument extends Document> extends DocumentSheetConfig<Document> {
	override getData(
		options?: Partial<FormApplicationOptions> | undefined,
	): DocumentSheetConfigData<TDocument> | Promise<DocumentSheetConfigData<TDocument>> {
		const data = super.getData(options) as unknown as DocumentSheetConfigData<TDocument>
		delete data.sheetClasses[`${SYSTEM_NAME}.MookGeneratorSheet`]
		// delete data.defaultClass[`${SYSTEM_NAME}.MookGeneratorSheet`]
		return data
	}
}

export { DocumentSheetConfigGURPS }
