import { ActorType, COMPENDIA, ConditionID, ManeuverID, SYSTEM_NAME } from "@module/data/constants.ts"
import { TokenGURPS } from "./object.ts"
import { ErrorGURPS, htmlQuery, htmlQueryAll } from "@util"

export interface TokenHUDDataGURPS extends TokenHUDData {
	statuses: Partial<TokenHUDStatusEffectChoice>[]
	maneuvers: Partial<TokenHUDStatusEffectChoice>[]
	inCombat: boolean
}

export class TokenHUDGURPS<TToken extends TokenGURPS> extends TokenHUD<TToken> {
	_maneuvers = false

	override get template(): string {
		return `systems/${SYSTEM_NAME}/templates/hud/token.hbs`
	}

	override activateListeners($html: JQuery<HTMLElement>): void {
		super.activateListeners($html)

		const html = $html[0]

		for (const control of htmlQueryAll(html, ".effect-control")) {
			control.addEventListener("click", event => this._setStatusValue(event, control))
			control.addEventListener("contextmenu", event => this._setStatusValue(event, control))

			control.addEventListener("mouseover", () => {
				const titleBar = htmlQuery(html, ".title-bar")
				if (titleBar && control.title) {
					titleBar.innerText = control.title
					titleBar.classList.toggle("active")
				}
			})
			control.addEventListener("mouseout", () => {
				const titleBar = htmlQuery(html, ".title-bar")
				if (titleBar && control.title) {
					titleBar.innerText = control.title
					titleBar.classList.toggle("active")
				}
			})
		}

		this._toggleManeuvers(this._maneuvers)
	}

	// @ts-expect-error async
	override async getData(options?: ApplicationOptions | undefined): Promise<TokenHUDDataGURPS> {
		const data = super.getData(options)

		return fu.mergeObject(data, {
			statuses: await this.#getStatusEffectChoices(),
			maneuvers: await this.#getManeuverChoices(),
			inCombat: this.object.inCombat,
		})
	}

	protected async _setStatusValue(event: MouseEvent, icon: HTMLElement): Promise<unknown> {
		const statusId = icon.dataset.statusId as ConditionID
		if (!statusId) throw ErrorGURPS("The provided status ID is not valid.")
		if (!this.object.actor) throw ErrorGURPS("This Token does not have an Actor attached to it.")

		if (icon.dataset.type === "maneuver" && this.object.actor.isOfType(ActorType.Character)) {
			if (event.type === "contextmenu") return this.object.actor.setManeuver(null)
			return this.object.actor.setManeuver(statusId)
		}

		if (event.type === "click") {
			return this.object.actor.increaseCondition(statusId)
		} else if (event.type === "contextmenu") {
			if (event.ctrlKey) return this.object.actor.decreaseCondition(statusId, { forceRemove: true })
			else return this.object.actor.decreaseCondition(statusId)
		}
		return
	}

	async #getStatusEffectChoices(): Promise<Partial<TokenHUDStatusEffectChoice>[]> {
		const indexFields = ["system.slug"]
		const pack = game.packs.get(`${SYSTEM_NAME}.${COMPENDIA.CONDITIONS}`)
		if (pack) {
			const index = await pack.getIndex({ fields: indexFields })
			return index
				.map(a => {
					return {
						id: a.system.slug,
						title: a.name,
						src: a.img,
						isActive: this.object.actor?.itemCollections.conditions.some(
							e => e.system.slug === a.system.slug,
						),
					}
				})
				.sort(
					(a, b) =>
						Object.keys(CONFIG.GURPS.statusEffects.conditions).indexOf(a.id) -
						Object.keys(CONFIG.GURPS.statusEffects.conditions).indexOf(b.id),
				)
		}
		return []
	}

	async #getManeuverChoices(): Promise<Partial<TokenHUDStatusEffectChoice>[]> {
		const indexFields = ["system.slug"]
		const pack = game.packs.get(`${SYSTEM_NAME}.${COMPENDIA.MANEUVERS}`)
		if (pack) {
			const index = await pack.getIndex({ fields: indexFields })
			return index
				.map(a => {
					return {
						id: a.system.slug,
						title: a.name,
						src: a.img,
					}
				})
				.sort((a, b) => Object.values(ManeuverID).indexOf(a.id) - Object.values(ManeuverID).indexOf(b.id))
		}
		return []
	}

	// Change visibility of maneuvers panel
	protected _toggleManeuvers(active: boolean): void {
		this._maneuvers = active

		const button = htmlQuery(this.element[0], `.control-icon[data-action="maneuvers"]`)
		if (button) {
			button.classList.toggle("active", active)
			const palette = htmlQuery(button, ".maneuvers")
			palette?.classList.toggle("active", active)
		}
	}

	protected override _onClickControl(event: MouseEvent): void {
		super._onClickControl(event)
		if (event.defaultPrevented) return
		const button = event.currentTarget as HTMLElement
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

	protected _onToggleManeuvers(event: MouseEvent): void {
		event.preventDefault()
		this._maneuvers = (event.currentTarget as HTMLElement).classList.contains("active")
		this._toggleStatusEffects(false)
		this._toggleManeuvers(!this._maneuvers)
	}

	// static async #setStatusValue(event: MouseEvent, token: TokenGURPS): Promise<void> {
	// 	event.preventDefault()
	// 	event.stopPropagation()
	//
	// 	const icon = event.currentTarget
	// 	if (!(icon instanceof HTMLPictureElement)) return
	// 	const id: EffectID = icon.dataset.statusId as EffectID
	// 	const { actor } = token
	// 	if (!(actor && id)) return
	//
	// 	if (event.type === "click") {
	// 		// @ts-expect-error awaiting implementation
	// 		await actor?.increaseCondition(id)
	// 	} else if (event.type === "contextmenu") {
	// 		// @ts-expect-error awaiting implementation
	// 		if (event.ctrlKey) await actor?.decreaseCondition(id, { forceRemove: true })
	// 		// @ts-expect-error awaiting implementation
	// 		else await actor?.decreaseCondition(id)
	// 	}
	// 	game.socket?.emit(`system.${SYSTEM_NAME}`, { type: SOCKET.UPDATE_BUCKET, users: [] })
	// 	game.gurps.effectPanel.refresh()
	// }
	//
	// static async #setActiveEffects(token: TokenGURPS, icons: NodeListOf<HTMLImageElement>) {
	// 	// @ts-expect-error awaiting implementation
	// 	const affectingConditions = token.actor?.conditions
	//
	// 	for (const icon of icons) {
	// 		const picture = document.createElement("picture")
	// 		picture.classList.add("effect-control")
	// 		picture.dataset.statusId = icon.dataset.statusId
	// 		if (icon.title) picture.title = icon.title
	// 		else picture.setAttribute("style", "cursor: default;")
	// 		const iconSrc = icon.getAttribute("src")!
	// 		picture.setAttribute("src", iconSrc)
	// 		const newIcon = document.createElement("img")
	// 		newIcon.src = iconSrc
	// 		picture.append(newIcon)
	// 		icon.replaceWith(picture)
	//
	// 		const id = picture.dataset.statusId ?? ""
	//
	// 		// @ts-expect-error awaiting implementation
	// 		const affecting = affectingConditions?.filter(c => c.cid === id) || []
	// 		if (affecting.length > 0 || iconSrc === token.document.overlayEffect) {
	// 			picture.classList.add("active")
	// 		}
	//
	// 		if (affecting.length > 0) {
	// 			// Show a badge icon if the condition has a value or is locked
	//
	// 			// @ts-expect-error awaiting implementation
	// 			const hasValue = affecting.some(c => c.canLevel)
	//
	// 			if (hasValue) {
	// 				const badge = document.createElement("i")
	// 				badge.classList.add("badge")
	//
	// 				// @ts-expect-error awaiting implementation
	// 				const value = Math.max(...affecting.map(c => c.level ?? 1))
	// 				badge.innerText = value.toString()
	// 				picture.append(badge)
	// 			}
	// 		}
	// 	}
	// }
	//
	// static async onRenderTokenHUD(html: HTMLElement, tokenData: TokenHUDData<TokenGURPS>): Promise<void> {
	// 	console.log(html, tokenData)
	//
	// 	const token = canvas?.tokens?.get(tokenData._id ?? "") as TokenGURPS
	// 	if (!token) return
	//
	// 	console.log(token)
	//
	// 	const iconGrid = html.querySelector<HTMLElement>(".status-effects")
	// 	const maneuverGrid = html.querySelector<HTMLElement>(".maneuvers")
	// 	if (!iconGrid) throw ErrorGURPS("Unexpected error retrieving status effects grid")
	// 	const statusIcons = iconGrid.querySelectorAll<HTMLImageElement>(".effect-control")
	// 	const maneuverIcons = maneuverGrid?.querySelectorAll<HTMLImageElement>(".effect-control")
	//
	// 	await this.#setActiveEffects(token, statusIcons)
	// 	this.#activateListeners(iconGrid, token)
	//
	// 	if (maneuverGrid && maneuverIcons) {
	// 		await this.#setActiveEffects(token, maneuverIcons)
	// 		this.#activateListeners(maneuverGrid, token)
	// 	}
	// }
	//
	// _onToggleEffect(event: JQuery.ClickEvent | JQuery.ContextMenuEvent, { overlay = false } = {}): Promise<boolean> {
	// 	event.preventDefault()
	// 	event.stopPropagation()
	// 	const img = event.currentTarget
	// 	const effect =
	// 		img.dataset.statusId && this.object?.actor
	// 			? CONFIG.statusEffects.find(e => e.id === img.dataset.statusId)
	// 			: img.getAttribute("src")
	// 	return this.object!.toggleEffect(effect, { overlay })
	// }
}
