import { ContainerGURPS } from "@item/container"
import { NoteContainerSource } from "./data"

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
		const text = this.system.text
		return converter.makeHtml(text)?.replace(/\s\+/g, "\r")
	}

	get reference(): string {
		return this.system.reference
	}
}
