import { ContainerGURPS } from "@item/container"
import { NoteContainerSource } from "./data"
import { EvalEmbeddedRegex, replaceAllStringFunc } from "@util"
import { ActorType } from "@module/data"
import { NoteGURPS } from "@item/note/document"
import { ItemGCS } from "@item/gcs"

export class NoteContainerGURPS extends ContainerGURPS<NoteContainerSource> {
	override get actor(): (typeof CONFIG.GURPS.Actor.documentClasses)[ActorType.Character] | null {
		const actor = super.actor
		if (actor?.type === ActorType.Character) return actor
		return null
	}

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

	get children(): Collection<NoteGURPS | NoteContainerGURPS> {
		return super.children as Collection<NoteGURPS | NoteContainerGURPS>
	}

	secondaryText = ItemGCS.prototype.secondaryText

	get enabled(): boolean {
		return true
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
