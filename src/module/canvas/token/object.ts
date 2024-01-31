import { ActorGURPS } from "@actor/document.ts"
import { TokenDocumentGURPS } from "./document.ts"

export class TokenGURPS<TDocument extends TokenDocumentGURPS = TokenDocumentGURPS> extends Token<TDocument> {
	override get actor(): ActorGURPS {
		return super.actor as ActorGURPS
	}

	protected override _onControl(options: { releaseOthers?: boolean; pan?: boolean } = {}): void {
		if (game.ready) game.gurps.effectPanel.refresh()
		super._onControl(options)
	}

	protected override _onRelease(options?: Record<string, unknown>): void {
		game.gurps.effectPanel.refresh()
		return super._onRelease(options)
	}
}
