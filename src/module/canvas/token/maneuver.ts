import { CharacterManeuver } from "@system/maneuver-manager.ts"
import { TokenGURPS } from "./object.ts"
import { ActorType, MANEUVER_DETAIL_SETTING, ManeuverID, SETTINGS, SYSTEM_NAME } from "@module/data/constants.ts"

class TokenManeuver extends PIXI.Container {
	token: TokenGURPS

	maneuver: CharacterManeuver | null = null

	bg?: PIXI.Graphics

	constructor(token: TokenGURPS) {
		super()
		this.token = token
		if (token.actor?.isOfType(ActorType.Character)) {
			this.setManeuver(token.actor.system.move.maneuver)
		}
	}

	setManeuver(maneuver: CharacterManeuver | null): void {
		this.maneuver = maneuver
	}

	async draw(): Promise<PIXI.Sprite | undefined> {
		this.removeChildren().forEach(c => c.destroy())
		this.bg = this.addChild(new PIXI.Graphics())
		this.bg.visible = false

		if (!this.maneuver) return

		const tex = (await loadTexture(this._imagePath, { fallback: "icons/svg/hazard.svg" })) as PIXI.Texture
		if (!tex) return
		const icon = new PIXI.Sprite(tex)
		return this.addChild(icon)
	}

	refresh(): void {
		const width = Math.round(canvas.dimensions.size / 2 / 5) * 2
		const bg = this.bg?.clear().beginFill(0x000000, 0.4).lineStyle(1.0, 0x000000)
		for (const child of this.children as PIXI.Graphics[]) {
			if (child === bg) continue

			child.width = child.height = width
			child.x = 4 * width
			child.y = 0
			bg?.drawRoundedRect(child.x + 1, child.y + 1, width - 2, width - 2, 2)
		}
		if (this.bg) this.bg.visible = true
		this.token.addChild(this)
	}

	getFilteredName(name: ManeuverID): ManeuverID {
		if (game.user.isGM || this.token.isOwner) return name
		const detail = game.settings.get(SYSTEM_NAME, SETTINGS.MANEUVER_DETAIL)
		switch (detail) {
			case MANEUVER_DETAIL_SETTING.FULL:
				return name
			case MANEUVER_DETAIL_SETTING.NO_FEINT:
				if (name === ManeuverID.Feint) return ManeuverID.Attack
				return name
			case MANEUVER_DETAIL_SETTING.GENERAL:
				switch (name) {
					case ManeuverID.AOAFeint:
					case ManeuverID.AOADouble:
					case ManeuverID.AOADetermined:
					case ManeuverID.AOAStrong:
					case ManeuverID.AOASF:
						return ManeuverID.AOA
					case ManeuverID.AODDouble:
					case ManeuverID.AODDodge:
					case ManeuverID.AODParry:
					case ManeuverID.AODBlock:
						return ManeuverID.AOD
					case ManeuverID.Feint:
						return ManeuverID.Attack
					default:
						return name
				}
		}
		return name
	}

	get _imagePath(): string {
		if (!this.maneuver) return ""
		const name = this.getFilteredName(this.maneuver.id)
		return `systems/${SYSTEM_NAME}/assets/maneuver/${name}.webp`
	}
}

export { TokenManeuver }
