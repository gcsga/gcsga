import { ItemDataModel } from "@module/data/item/abstract.ts"
import fields = foundry.data.fields
import { EvalEmbeddedRegex, cell, replaceAllStringFunc } from "@util"
import { CellData } from "../components/cell-data.ts"

class NoteTemplate extends ItemDataModel<NoteTemplateSchema> {
	static override defineSchema(): NoteTemplateSchema {
		const fields = foundry.data.fields

		return {
			// text: new fields.StringField({ required: true, nullable: false, initial: "" }),
			text: new fields.HTMLField({ required: true, nullable: false, initial: "" }),
		}
	}

	override get cellData(): Record<string, CellData> {
		return {
			// TODO: revise
			text: new CellData({ type: cell.Type.Markdown, primary: this.enrichedText as unknown as string }),
			reference: new CellData({
				type: cell.Type.PageRef,
				primary: this.reference,
				secondary: this.reference_highlight === "" ? this.text : this.reference_highlight,
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

	// get processedText(): Handlebars.SafeString {
	// 	const showdownOptions = { ...CONST.SHOWDOWN_OPTIONS }
	//
	// 	Object.entries(showdownOptions).forEach(([k, v]) => {
	// 		showdown.setOption(k, v)
	// 	})
	//
	// 	const converter = new showdown.Converter()
	// 	let text = this.text
	// 	text = replaceAllStringFunc(EvalEmbeddedRegex, text, this.actor)
	//
	// 	return new Handlebars.SafeString(converter.makeHtml(text)?.replaceAll(/\s\+/g, "\r"))
	// }
}

interface NoteTemplate extends ModelPropsFromSchema<NoteTemplateSchema> {
	reference: string
	reference_highlight: string
}

type NoteTemplateSchema = {
	text: fields.HTMLField<string, string, true, false, true>
}

export { NoteTemplate, type NoteTemplateSchema }
