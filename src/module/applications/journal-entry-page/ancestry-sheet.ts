import { SYSTEM_NAME } from "@module/data/constants.ts"
import { AncestryData, AncestrySchema } from "@module/data/journal-entry-page/ancestry.ts"

type AncestryPage = JournalEntryPage & { system: AncestryData }

class AncestrySheet extends JournalPageSheet<AncestryPage> {
	static override get defaultOptions(): DocumentSheetOptions {
		return {
			...super.defaultOptions,
			submitOnClose: false,
			submitOnChange: false,
		}
	}

	override get template(): string {
		return `systems/${SYSTEM_NAME}/templates/journal/page-${this.document.type}-${this.isEditable ? "edit" : "view"}.hbs`
	}

	override getData(
		options?: Partial<DocumentSheetOptions> | undefined,
	): AncestrySheetData | Promise<AncestrySheetData> {
		const context = super.getData(options)
		console.log(context)
		return {
			...context,
			page: this.page,
			system: this.page.system,
			source: this.page.system.toObject(),
			fields: this.page.system.schema.fields,
		} as AncestrySheetData
	}

	get page(): AncestryPage {
		return this.document as AncestryPage
	}
}

interface AncestrySheet {
	constructor: typeof AncestrySheet
}

interface AncestrySheetData extends DocumentSheetData<AncestryPage> {
	page: AncestryPage
	system: AncestryData
	source: SourceFromSchema<AncestrySchema>
	fields: foundry.data.fields.SchemaField<AncestrySchema>["fields"]
}

export { AncestrySheet }
