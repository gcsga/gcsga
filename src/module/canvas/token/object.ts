// import { LastActor } from "@module/util/last-actor.ts"
// import * as R from "remeda"
// import type { TokenDocumentGURPS } from "@scene"
// import { CanvasGURPS } from "../index.ts"
// import { ActorType } from "@module/data/constants.ts"
// import { TokenManeuver } from "./maneuver.ts"
//
// class TokenGURPS<TDocument extends TokenDocumentGURPS = TokenDocumentGURPS> extends Token<TDocument> {
// 	readonly maneuver: TokenManeuver
//
// 	constructor(document: TDocument) {
// 		super(document)
// 		this.maneuver = this.addChild(new TokenManeuver(this))
// 	}
//
// 	protected override _onControl(
// 		options?: { releaseOthers?: boolean | undefined; pan?: boolean | undefined } | undefined,
// 	): void {
// 		if (game.ready) game.gurps.effectPanel.refresh()
// 		if (this.actor) LastActor.set(this.actor, this.document)
// 		return super._onControl(options)
// 	}
//
// 	/** Refresh vision and the `EffectsPanel` */
// 	protected override _onRelease(options?: Record<string, unknown>): void {
// 		game.gurps.effectPanel.refresh()
// 		return super._onRelease(options)
// 	}
//
// 	override async drawEffects(): Promise<void> {
// 		await super.drawEffects()
// 		// await this._animation
//
// 		if (!this.actor?.isOfType(ActorType.Character)) return
//
// 		const maneuver = this.actor.system.move.maneuver
// 		this.maneuver.setManeuver(maneuver)
// 		await this.maneuver.draw()
// 		if (maneuver) {
// 			this.maneuver.refresh()
// 		}
// 	}
//
// 	// override async toggleCombatant(combat?: Combat | undefined): Promise<this> {
// 	// 	if (this.actor?.isOfType(ActorType.Character)) {
// 	// 		if (this.inCombat) await this.actor.setManeuver(null)
// 	// 		else await this.actor.setManeuver(ManeuverID.DoNothing)
// 	// 	}
// 	// 	return super.toggleCombatant(combat)
// 	// }
//
// 	async showFloatyText(params: showFloatyTextOptions): Promise<void> {
// 		if (!this.isVisible) return
//
// 		const scrollingTextArgs = ((): Parameters<CanvasGURPS["interface"]["createScrollingText"]> | null => {
// 			if (typeof params === "number") {
// 				const quantity = params
// 				// TODO: allow changing this to something else arbitrarily
// 				const maxHP = this.actor?.pools?.HP?.max
// 				if (!(quantity && typeof maxHP === "number")) return null
//
// 				const percent = Math.clamp(Math.abs(quantity) / maxHP, 0, 1)
// 				const textColors = {
// 					damage: 16711680, // reddish
// 					healing: 65280, // greenish
// 				}
// 				return [
// 					this.center,
// 					params.signedString(),
// 					{
// 						anchor: CONST.TEXT_ANCHOR_POINTS.TOP,
// 						jitter: 0.25,
// 						fill: textColors[quantity < 0 ? "damage" : "healing"],
// 						fontSize: 16 + 32 * percent, // Range between [16, 48]
// 						stroke: 0x000000,
// 						strokeThickness: 4,
// 					},
// 				]
// 			} else {
// 				const [change, details] = Object.entries(params)[0]
// 				const isAdded = change === "create"
// 				const sign = isAdded ? "+ " : "- "
// 				const appendedNumber = !/ \d+$/.test(details.name) && details.level ? ` ${details.level}` : ""
// 				const content = `${sign}${details.name}${appendedNumber}`
// 				const anchorDirection = isAdded ? CONST.TEXT_ANCHOR_POINTS.TOP : CONST.TEXT_ANCHOR_POINTS.BOTTOM
// 				const textStyle = R.pick(this._getTextStyle(), ["fill", "fontSize", "stroke", "strokeThickness"])
//
// 				return [
// 					this.center,
// 					content,
// 					{
// 						...textStyle,
// 						anchor: anchorDirection,
// 						direction: anchorDirection,
// 						jitter: 0.25,
// 					},
// 				]
// 			}
// 		})()
// 		if (!scrollingTextArgs) return
//
// 		// await this._animation
// 		await canvas.interface?.createScrollingText(...scrollingTextArgs)
// 	}
// }
//
// interface TokenGURPS<TDocument extends TokenDocumentGURPS = TokenDocumentGURPS> extends Token<TDocument> {}
//
// type NumericFloatyEffect = { name: string; level?: number | null }
// export type showFloatyTextOptions =
// 	| number
// 	| { create: NumericFloatyEffect }
// 	| { update: NumericFloatyEffect }
// 	| { delete: NumericFloatyEffect }
//
// export { TokenGURPS }
