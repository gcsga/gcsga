import { SYSTEM_NAME } from "@module/data"

// @ts-expect-error JournalPDFPageSheet type not declared
export class PDFEditorSheet extends JournalPDFPageSheet {
	declare isEditable: boolean

	get template(): string {
		return `systems/${SYSTEM_NAME}/templates/app/pdf-${this.isEditable ? "edit" : "view"}.hbs`
	}

	protected async _updateObject(event: Event, formData: any): Promise<unknown> {
		await super._updateObject(event, formData)
		// @ts-expect-error JournalPDFPageSheet type not declared
		return this.render(true)
	}
}
