import { SYSTEM_NAME } from "@data"
import { JournalEntryPagePDF } from "./document.ts"
import { URLSearchParams } from "url"

export class JournalPagePDFEditorSheet<
	TDocument extends JournalEntryPagePDF = JournalEntryPagePDF,
> extends JournalPageSheet<TDocument> {
	override get template(): string {
		return `systems/${SYSTEM_NAME}/templates/app/pdf-${this.isEditable ? "edit" : "view"}.hbs`
	}
}

export class JournalEntryPagePDFViewerSheet<
	TDocument extends JournalEntryPagePDF = JournalEntryPagePDF,
> extends JournalPageSheet<TDocument> {
	declare pageNumber: number

	constructor(object: TDocument, options?: DocumentSheetOptions & { pageNumber?: number }) {
		super(object, options)
		this.pageNumber = options?.pageNumber ?? 0
	}

	static override get defaultOptions(): DocumentSheetOptions {
		return fu.mergeObject(super.defaultOptions, {
			classes: ["gurps", "pdf"],
			width: 860,
			height: 900,
			resizable: true,
			popOut: true,
		})
	}

	override get template(): string {
		return `systems/${SYSTEM_NAME}/templates/app/pdf.hbs`
	}

	_getViewerParams(): URLSearchParams {
		const params = new URLSearchParams()
		if (this.object.src) {
			// @ts-expect-error no definitions yet
			const src = URL.parseSafe(this.object.src) ? this.object.src : foundry.utils.getRoute(this.object.src)
			params.append("file", src)
		}
		return params
	}

	override getData(
		options?: Partial<DocumentSheetOptions> | undefined,
	): DocumentSheetData<TDocument> | Promise<DocumentSheetData<TDocument>> {
		return fu.mergeObject(super.getData(options), {
			pageNumber: this.pageNumber,
			params: this._getViewerParams(),
		})
	}
}
