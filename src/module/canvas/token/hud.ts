import { SOCKET, SYSTEM_NAME } from "@module/data/misc.ts"
import { TokenGURPS } from "./object.ts"
import { EffectID, ManeuverID } from "@item/condition/index.ts"

export interface TokenHUDDataGURPS extends TokenHUDData {
	maneuvers: Record<string, TokenHUDStatusEffectChoice | undefined>
}

export interface TokenHUDGURPS<TToken extends TokenGURPS> extends TokenHUD<TToken> {
	object: TToken
}

export class TokenHUDGURPS<TToken extends TokenGURPS> extends TokenHUD<TToken> {
	_maneuvers = false

	override get template(): string {
		return `systems/${SYSTEM_NAME}/templates/hud/token.hbs`
	}

	static #activateListeners(html: HTMLElement, token: TokenGURPS): void {
		const effectControls = html.querySelectorAll<HTMLPictureElement>(".effect-control")

		for (const control of effectControls) {
			control.addEventListener("click", event => {
				this.#setStatusValue(event, token)
			})
			control.addEventListener("contextmenu", event => {
				this.#setStatusValue(event, token)
			})

			control.addEventListener("mouseover", () => {
				this.#showStatusLabel(control)
			})
			control.addEventListener("mouseout", () => {
				this.#showStatusLabel(control)
			})
		}
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)
		this._toggleManeuvers(this._maneuvers)
	}

	override getData(options: ApplicationOptions): TokenHUDDataGURPS {
		const data = fu.mergeObject(super.getData(options), {
			inCombat: this.object?.inCombat,
			maneuvers: this._getManeuverChoices(),
		}) as TokenHUDDataGURPS
		return data
	}

	_getManeuverChoices(): Record<string, TokenHUDStatusEffectChoice | undefined> {
		const effects = super._getStatusEffectChoices()
		const filteredEffects = Object.keys(effects)
			.filter((key: string) => key.includes("/maneuver/"))
			.reduce((obj, key: string) => {
				return Object.assign(obj, {
					[key]: effects[key],
				})
			}, {})
		return filteredEffects
	}

	override _getStatusEffectChoices(): Record<string, TokenHUDStatusEffectChoice | undefined> {
		const effects = super._getStatusEffectChoices()
		const filteredEffects = Object.keys(effects)
			.filter((key: string) => key.includes("/status/"))
			.reduce((obj, key: string) => {
				return Object.assign(obj, {
					[key]: effects[key],
				})
			}, {})
		return filteredEffects
	}

	protected async _onToggleCombat(event: JQuery.ClickEvent): Promise<void> {
		event.preventDefault()
		// await super._onToggleCombat(event)
		const { actor } = this.object
		if (actor) {
			if (this.object?.inCombat) await actor.changeManeuver(ManeuverID.DoNothing)
			else actor.resetManeuvers()
		}
		await this.render(true)
	}

	protected _onClickControl(event: JQuery.ClickEvent): void {
		// super._onClickControl(event)
		const button = event.currentTarget
		switch (button.dataset.action) {
			case "maneuvers":
				return this._onToggleManeuvers(event)
		}
	}

	protected _onToggleStatusEffects(event: JQuery.ClickEvent): void {
		event.preventDefault()
		this._toggleManeuvers(false)
		this._toggleStatusEffects(!this._statusEffects)
	}

	protected _onToggleManeuvers(event: JQuery.ClickEvent): void {
		event.preventDefault()
		this._maneuvers = $(event.currentTarget).hasClass("active")
		this._toggleStatusEffects(false)
		this._toggleManeuvers(!this._maneuvers)
	}

	_toggleManeuvers(active: boolean): void {
		this._maneuvers = active
		const button = this.element.find('.control-icon[data-action="maneuvers"]')[0]
		if (!button) return
		button.classList.toggle("active", active)
		const palette = button.querySelector(".maneuvers")
		palette?.classList.toggle("active", active)
	}

	static #showStatusLabel(icon: HTMLPictureElement): void {
		const titleBar = icon.closest(".icon-grid")?.querySelector<HTMLElement>(".title-bar")
		if (titleBar && icon.title) {
			titleBar.innerText = icon.title
			titleBar.classList.toggle("active")
		}
	}

	static async #setStatusValue(event: MouseEvent, token: TokenGURPS): Promise<void> {
		event.preventDefault()
		event.stopPropagation()

		const icon = event.currentTarget
		if (!(icon instanceof HTMLPictureElement)) return
		const id: EffectID = icon.dataset.statusId as EffectID
		const { actor } = token
		if (!(actor && id)) return
		// const combatant = token.combatant

		if (event.type === "click") {
			await actor?.increaseCondition(id)
		} else if (event.type === "contextmenu") {
			if (event.ctrlKey) await actor?.decreaseCondition(id, { forceRemove: true })
			else await actor?.decreaseCondition(id)
		}
		game.socket?.emit(`system.${SYSTEM_NAME}`, { type: SOCKET.UPDATE_BUCKET, users: [] })
		game.gurps.effectPanel.refresh()
	}

	static async #setActiveEffects(token: TokenGURPS, icons: NodeListOf<HTMLImageElement>) {
		const affectingConditions = token.actor.conditions

		for (const icon of icons) {
			const picture = document.createElement("picture")
			picture.classList.add("effect-control")
			picture.dataset.statusId = icon.dataset.statusId
			if (icon.title) picture.title = icon.title
			else picture.setAttribute("style", "cursor: default;")
			const iconSrc = icon.getAttribute("src")!
			picture.setAttribute("src", iconSrc)
			const newIcon = document.createElement("img")
			newIcon.src = iconSrc
			picture.append(newIcon)
			icon.replaceWith(picture)

			const id = picture.dataset.statusId ?? ""
			const affecting = affectingConditions?.filter(c => c.cid === id) || []
			if (affecting.length > 0 || iconSrc === token.document.overlayEffect) {
				picture.classList.add("active")
			}

			if (affecting.length > 0) {
				// Show a badge icon if the condition has a value or is locked
				const hasValue = affecting.some(c => c.canLevel)

				if (hasValue) {
					const badge = document.createElement("i")
					badge.classList.add("badge")
					const value = Math.max(...affecting.map(c => c.level ?? 1))
					badge.innerText = value.toString()
					picture.append(badge)
				}
			}
		}
	}

	static async onRenderTokenHUD(html: HTMLElement, tokenData: Record<string, string>): Promise<void> {
		const token = canvas?.tokens?.get(tokenData._id) as TokenGURPS
		if (!token) return

		const iconGrid = html.querySelector<HTMLElement>(".status-effects")
		const maneuverGrid = html.querySelector<HTMLElement>(".maneuvers")
		if (!iconGrid) throw Error("Unexpected error retrieving status effects grid")
		const statusIcons = iconGrid.querySelectorAll<HTMLImageElement>(".effect-control")
		const maneuverIcons = maneuverGrid?.querySelectorAll<HTMLImageElement>(".effect-control")

		await this.#setActiveEffects(token, statusIcons)
		this.#activateListeners(iconGrid, token)

		if (maneuverGrid && maneuverIcons) {
			await this.#setActiveEffects(token, maneuverIcons)
			this.#activateListeners(maneuverGrid, token)
		}
	}

	_onToggleEffect(event: JQuery.ClickEvent | JQuery.ContextMenuEvent, { overlay = false } = {}): Promise<boolean> {
		event.preventDefault()
		event.stopPropagation()
		const img = event.currentTarget
		const effect =
			img.dataset.statusId && this.object?.actor
				? CONFIG.statusEffects.find(e => e.id === img.dataset.statusId)
				: img.getAttribute("src")
		return this.object!.toggleEffect(effect, { overlay })
	}
}
