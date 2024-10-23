import { ItemDataModel } from "@module/data/item/abstract.ts"
import fields = foundry.data.fields
import { EvalEmbeddedRegex, cell, replaceAllStringFunc } from "@util"
import { CellData, CellDataOptions } from "../components/cell-data.ts"
import { ItemType } from "@module/data/constants.ts"

class NoteTemplate extends ItemDataModel<NoteTemplateSchema> {
	static override defineSchema(): NoteTemplateSchema {
		const fields = foundry.data.fields

		return {
			// text: new fields.StringField({ required: true, nullable: false, initial: "" }),
			text: new fields.HTMLField({ required: true, nullable: false, initial: "" }),
		}
	}

	override cellData(_options: CellDataOptions = {}): Record<string, CellData> {
		return {
			dropdown: new CellData({
				type: this.isOfType(ItemType.NoteContainer) ? cell.Type.Dropdown : cell.Type.Text,
				open: this.isOfType(ItemType.NoteContainer) ? this.open : null,
				classList: ["item-dropdown"],
			}),
			name: new CellData({ type: cell.Type.Text, primary: this.parent.name, classList: ["item-name"] }),
			text: new CellData({
				type: cell.Type.Markdown,
				primary: this.enrichedText as unknown as string,
				condition: false,
			}),
			reference: new CellData({
				type: cell.Type.PageRef,
				primary: this.reference,
				secondary: this.reference_highlight === "" ? this.text : this.reference_highlight,
				condition: false,
			}),
		}
	}

	get processedName(): string {
		return this.parent.name
	}

	get enrichedText(): Promise<string> {
		let text = this.text
		text = replaceAllStringFunc(EvalEmbeddedRegex, text, this.actor)
		return TextEditor.enrichHTML(text, {
			async: false,
		})
	}
}

interface NoteTemplate extends ModelPropsFromSchema<NoteTemplateSchema> {
	reference: string
	reference_highlight: string
}

type NoteTemplateSchema = {
	text: fields.HTMLField<string, string, true, false, true>
}

export { NoteTemplate, type NoteTemplateSchema }
