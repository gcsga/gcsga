import DocumentSheetV2 from "../api/document-sheet.js"

/**
 * A base class for providing Actor Sheet behavior using ApplicationV2.
 */
export default class ActorSheetV2<TActor extends Actor> extends DocumentSheetV2<TActor> {
	/**
	 * The Actor document managed by this sheet.
	 * @type {TActor}
	 */
	get actor(): TActor

	/**
	 * If this sheet manages the ActorDelta of an unlinked Token, reference that Token document.
	 */
	get token(): TokenDocument | null
}
