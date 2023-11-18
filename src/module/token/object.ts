import { ActorGURPS } from "@module/config"
import { ConfiguredDocumentClass, PropertiesToSource } from "types/types/helperTypes"
import { TokenDocumentGURPS } from "./document";
import { TokenDataProperties } from "types/foundry/common/data/data.mjs/tokenData";
import { DocumentModificationOptions } from "types/foundry/common/abstract/document.mjs";

export class TokenGURPS extends Token {
	x!: number

	y!: number

	hitArea!: {
		right: number
		bottom: number
	}

	document!: TokenDocumentGURPS

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

	protected _onCreate(options: PropertiesToSource<TokenDataProperties>, userId: DocumentModificationOptions): void {
		super._onCreate(options, userId)
		// Force container actor to go through data preparation once to ensure features are applied
		// TODO: this is slow. find a way around it.
		this.actor.prepareData()
	}
}
