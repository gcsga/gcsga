import { ItemGCS } from "@item/gcs"
import { NoteSource } from "./data"
import { EvalEmbeddedRegex, replaceAllStringFunc } from "@util"
export class NoteGURPS extends ItemGCS<NoteSource> {
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
		let text = this.system.text || this.name || ""
		text = replaceAllStringFunc(EvalEmbeddedRegex, text, this.actor)
		return converter.makeHtml(text)?.replace(/\s\+/g, "\r")
	}

	get enabled(): boolean {
		return true
	}

	secondaryText = ItemGCS.prototype.secondaryText

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
