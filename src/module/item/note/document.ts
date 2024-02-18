import { ItemGCS } from "@item/gcs/document.ts"
import { NoteSource, NoteSystemSource } from "./data.ts"
import { EvalEmbeddedRegex, replaceAllStringFunc } from "@util/regexp.ts"
import { CharacterResolver } from "@util"
import { ActorGURPS } from "@actor"

export interface NoteGURPS<TParent extends ActorGURPS | null> extends ItemGCS<TParent> {
	readonly _source: NoteSource
	system: NoteSystemSource
}

export class NoteGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGCS<TParent> {
	override get formattedName(): string {
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
		text = replaceAllStringFunc(EvalEmbeddedRegex, text, this.actor as unknown as CharacterResolver)
		return converter.makeHtml(text)?.replace(/\s\+/g, "\r")
	}

	override get enabled(): boolean {
		return true
	}

	override get reference(): string {
		return this.system.reference
	}
}
