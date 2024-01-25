import { ActorGURPS } from "@actor/document.ts"
import { ItemGCS } from "@item/gcs/document.ts"
import { NoteSystemData } from "./data.ts"
import { ItemType } from "@module/data/misc.ts"
import { EvalEmbeddedRegex, replaceAllStringFunc } from "@util/regexp.ts"

export interface NoteGURPS<TParent extends ActorGURPS> extends ItemGCS<TParent> {
	system: NoteSystemData
	type: ItemType.Note
}

export class NoteGURPS<TParent extends ActorGURPS = ActorGURPS> extends ItemGCS<TParent> {
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

	override get enabled(): boolean {
		return true
	}

	override secondaryText = ItemGCS.prototype.secondaryText

	override get reference(): string {
		return this.system.reference
	}
}
