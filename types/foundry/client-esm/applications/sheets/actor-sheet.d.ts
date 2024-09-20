import type DocumentSheetV2 from "../api/document-sheet.d.ts"

/** A base class for providing Actor Sheet behavior using ApplicationV2. */
export default class ActorSheetV2<TDocument extends Actor> extends DocumentSheetV2<TDocument> {
	static override DEFAULT_OPTIONS: Partial<ApplicationConfiguration>

	/** The Actor document managed by this sheet. */
	get actor(): TDocument

	/** The Token Document instance which owns this Actor, if any. */
	get token(): TDocument["token"]
}
