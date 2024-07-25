import { JournalEntryPageSource } from "types/foundry/common/documents/journal-entry-page.js"
import { JournalEntryGURPS } from "../document.ts"

export enum JournalEntryPageType {
	pdf = "pdf",
	image = "image",
	text = "text",
	video = "video",
}

export class JournalEntryPageGURPS<
	TParent extends JournalEntryGURPS | null = JournalEntryGURPS | null,
> extends JournalEntryPage<TParent> {}

export interface JournalEntryPagePDF<TParent extends JournalEntryGURPS | null = JournalEntryGURPS | null>
	extends JournalEntryPageGURPS<TParent> {
	type: "pdf"
	system: {
		offset: number
		code: string
	}
}

export class JournalEntryPagePDF<
	TParent extends JournalEntryGURPS | null = JournalEntryGURPS | null,
> extends JournalEntryPage<TParent> {}

export const JournalEntryPageProxyGURPS = new Proxy(JournalEntryPageGURPS, {
	construct(
		_target,
		args: [
			source: PreCreate<JournalEntryPageSource>,
			context: DocumentConstructionContext<JournalEntryGURPS | null>,
		],
	) {
		return new CONFIG.GURPS.JournalEntryPage.documentClasses[args[0].type as JournalEntryPageType](...args)
	},
})
