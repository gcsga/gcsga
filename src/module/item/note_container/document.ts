import { ContainerGURPS } from "@item/container"
import { NoteContainerSource } from "./data"
import { parseInlineNoteExpressions } from "@util"

export class NoteContainerGURPS extends ContainerGURPS<NoteContainerSource> {
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
		let text = this.system.text
		if (this.parent) text = parseInlineNoteExpressions(text ?? "", this.parent as any)
		return converter.makeHtml(text)?.replace(/\s\+/g, "\r")
	}

	get enabled(): boolean {
		return true
	}

	get secondaryText(): string {
		return ""
	}

	get reference(): string {
		return this.system.reference
	}

	protected _getCalcValues(): this["system"]["calc"] {
		return {
			name: this.formattedName,
			resolved_text: this.formattedName,
			indent: this.parents.length,
			resolved_notes: "",
		}
	}

	prepareDerivedData(): void {
		this.system.calc = this._getCalcValues()
	}
}
