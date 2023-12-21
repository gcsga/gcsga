import { BaseItemGURPS } from "@item/base"
import { NoteSource } from "./data"
import { parseInlineNoteExpressions } from "@util"

export class NoteGURPS extends BaseItemGURPS<NoteSource> {
	get formattedName(): string {
		return this.formattedText
	}

	get formattedText(): string {
		const showdown_options = {
			...CONST.SHOWDOWN_OPTIONS,
		}
		// @ts-expect-error Showdown not properly declared yet
		Object.entries(showdown_options).forEach(([k, v]) => showdown.setOption(k, v))
		// @ts-expect-error Showdown not properly declared yet
		const converter = new showdown.Converter()
		let text = this.system.text || this.name
		if (this.parent)
			text = parseInlineNoteExpressions(text ?? "", this.parent as any)
		return converter.makeHtml(text)?.replace(/\s\+/g, "\r")
	}

	get reference(): string {
		return this.system.reference
	}
}
