import { NoteContainerSource, NoteContainerSystemSource } from "./data.ts"
import { EvalEmbeddedRegex, replaceAllStringFunc } from "@util/regexp.ts"
import { NoteGURPS } from "@item/note/document.ts"
import { ItemGCS } from "@item/gcs/document.ts"
import { ActorGURPS } from "@actor"
import { ItemType } from "@data"

export interface NoteContainerGURPS<TParent extends ActorGURPS | null> extends ItemGCS<TParent> {
	readonly _source: NoteContainerSource
	system: NoteContainerSystemSource

	type: ItemType.NoteContainer
}

export class NoteContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGCS<TParent> {
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
		text = replaceAllStringFunc(EvalEmbeddedRegex, text, this.actor)
		return converter.makeHtml(text)?.replace(/\s\+/g, "\r")
	}

	override get children(): Collection<NoteGURPS | NoteContainerGURPS> {
		return super.children as Collection<NoteGURPS | NoteContainerGURPS>
	}

	override get enabled(): boolean {
		return true
	}

	override get reference(): string {
		return this.system.reference
	}
}
