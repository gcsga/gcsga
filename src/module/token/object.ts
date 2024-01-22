import { ActorGURPS } from "@module/config"
import { ConfiguredDocumentClass } from "types/types/helperTypes"
import { TokenDocumentGURPS } from "./document"

export class TokenGURPS extends Token<TokenDocumentGURPS> {
	x!: number

	y!: number

	hitArea!: {
		right: number
		bottom: number
	}

	get actor(): ActorGURPS {
		return super.actor as ActorGURPS
	}

	protected override _onControl(options: { releaseOthers?: boolean; pan?: boolean } = {}): void {
		if (game.ready) game.EffectPanel.refresh()
		super._onControl(options)
	}

	protected override _onRelease(
		options: PlaceableObject.ReleaseOptions
	): Promise<InstanceType<ConfiguredDocumentClass<typeof TokenDocument>>> | undefined {
		game.EffectPanel.refresh()
		return super._onRelease(options)
	}
}
