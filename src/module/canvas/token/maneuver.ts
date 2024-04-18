import { CharacterManeuver } from "@system/maneuver-manager.ts"
import { TokenGURPS } from "./object.ts"

class TokenManeuver extends PIXI.Container {
	token: TokenGURPS

	maneuver: CharacterManeuver | null

	constructor(token: TokenGURPS, maneuver: CharacterManeuver | null) {
		super()
		this.token = token
		this.maneuver = maneuver
	}

	// async reset(): Promise<void> {
	// 	// this.maneuver = maneuver
	// 	return this.draw()
	// }
	//
	// async draw(): Promise<void> {
	// 	const w = Math.round(canvas.dimensions.size / 2 / 5) * 2
	// 	const tex = (await loadTexture("icons/svg/hazard.svg")) as Texture
	// 	const icon = new PIXI.Sprite(tex)
	// 	// const bg = this.bg.clear().beginFill(0x00000000, 0.4).lineStyle(1.0, 0x00000000)
	// 	this.addChild(icon)
	// 	for (const child of this.children) {
	// 		child.width = child.height = w
	// 		child.x = this.token.width - w
	// 		child.y = 0
	// 	}
	// }
}

export { TokenManeuver }
