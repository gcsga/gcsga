import { BaseItemGURPS } from "@item/base"
import { NoteData } from "./data"

export class NoteGURPS extends BaseItemGURPS {
	readonly system!: NoteData

	get formattedName(): string {
		return this.formattedText
	}

	get formattedText(): string {
		const showdown_options = {
			// @ts-ignore until v10 types
			...CONST.SHOWDOWN_OPTIONS,
		}
		// @ts-ignore until v10 types
		Object.entries(showdown_options).forEach(([k, v]) => showdown.setOption(k, v))
		// @ts-ignore until v10 types
		const converter = new showdown.Converter()
		const text = this.system.text || this.name
		return converter.makeHtml(text)?.replace(/\s\+/g, "\r")
	}

	get reference(): string {
		return this.system.reference
	}
}
