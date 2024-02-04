import { TokenDocumentGURPS } from "@scene/token-document/document.ts"

export class TokenGURPS<TDocument extends TokenDocumentGURPS = TokenDocumentGURPS> extends Token<TDocument> {
	protected override _onControl(options: { releaseOthers?: boolean; pan?: boolean } = {}): void {
		if (game.ready) game.gurps.effectPanel.refresh()
		super._onControl(options)
	}

	protected override _onRelease(options?: Record<string, unknown>): void {
		game.gurps.effectPanel.refresh()
		return super._onRelease(options)
	}
}
