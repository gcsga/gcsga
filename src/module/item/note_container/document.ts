import { ActorGURPS } from "@actor/document.ts"
import { NoteContainerSystemData } from "./data.ts"
import { ContainerGURPS } from "@item/container/document.ts"
import { EvalEmbeddedRegex, replaceAllStringFunc } from "@util/regexp.ts"
import { NoteGURPS } from "@item/note/document.ts"
import { ItemGCS } from "@item/gcs/document.ts"
import { ItemType } from "@item/types.ts"

export interface NoteContainerGURPS<TParent extends ActorGURPS | null> extends ContainerGURPS<TParent> {
	system: NoteContainerSystemData
	type: ItemType.NoteContainer
}

export class NoteContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ContainerGURPS<TParent> {
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

	override get children(): Collection<NoteGURPS | NoteContainerGURPS> {
		return super.children as Collection<NoteGURPS | NoteContainerGURPS>
	}

	secondaryText = ItemGCS.prototype.secondaryText

	get enabled(): boolean {
		return true
	}

	get reference(): string {
		return this.system.reference
	}
}
