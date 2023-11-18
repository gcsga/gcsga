import { SYSTEM_NAME } from "@module/data"

// @ts-ignore
export class PDFEditorSheet extends JournalPDFPageSheet {
	// TODO: remove when types fixed
	isEditable!: boolean

	get template(): string {
		return `systems/${SYSTEM_NAME}/templates/app/pdf-${this.isEditable ? "edit" : "view"}.hbs`
	}

	protected async _updateObject(event: Event, formData: any): Promise<unknown> {
		await super._updateObject(event, formData)
		// @ts-ignore
		return this.render(true)
	}
}
