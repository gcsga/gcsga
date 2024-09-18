// import { ActorType, ConditionID, ManeuverID, SYSTEM_NAME } from "@module/data/constants.ts"
// import { TokenGURPS } from "./object.ts"
// import { ErrorGURPS, LocalizeGURPS, htmlQuery, htmlQueryAll } from "@util"
//
// export interface TokenHUDDataGURPS extends TokenHUDData {
// 	conditions: Partial<TokenHUDStatusEffectChoice>[]
// 	maneuvers: Partial<TokenHUDStatusEffectChoice>[]
// 	inCombat: boolean
// }
//
// export class TokenHUDGURPS<TToken extends TokenGURPS> extends TokenHUD<TToken> {
// 	_maneuvers = false
//
// 	override get template(): string {
// 		return `systems/${SYSTEM_NAME}/templates/hud/token.hbs`
// 	}
//
// 	override activateListeners($html: JQuery<HTMLElement>): void {
// 		super.activateListeners($html)
//
// 		const html = $html[0]
//
// 		for (const control of htmlQueryAll(html, ".effect-control")) {
// 			control.addEventListener("click", event => this._setStatusValue(event, control))
// 			control.addEventListener("contextmenu", event => this._setStatusValue(event, control))
//
// 			control.addEventListener("mouseover", () => {
// 				const titleBar = htmlQuery(html, ".title-bar")
// 				if (titleBar && control.title) {
// 					titleBar.innerText = control.title
// 					titleBar.classList.toggle("active")
// 				}
// 			})
// 			control.addEventListener("mouseout", () => {
// 				const titleBar = htmlQuery(html, ".title-bar")
// 				if (titleBar && control.title) {
// 					titleBar.innerText = control.title
// 					titleBar.classList.toggle("active")
// 				}
// 			})
// 		}
//
// 		this._toggleManeuvers(this._maneuvers)
// 	}
//
// 	override getData(options?: ApplicationOptions | undefined): TokenHUDDataGURPS {
// 		const data = super.getData(options)
//
// 		return fu.mergeObject(data, {
// 			conditions: this._getConditionChoices(),
// 			maneuvers: this._getManeuverChoices(),
// 			inCombat: this.object.inCombat,
// 		})
// 	}
//
// 	protected async _setStatusValue(event: MouseEvent, icon: HTMLElement): Promise<unknown> {
// 		const statusId = icon.dataset.statusId as ConditionID | ManeuverID
// 		if (!statusId) throw ErrorGURPS("The provided status ID is not valid.")
// 		if (!this.object.actor) throw ErrorGURPS("This Token does not have an Actor attached to it.")
//
// 		if (icon.dataset.type === "maneuver" && this.object.actor.isOfType(ActorType.Character)) {
// 			if ([ManeuverID.BLANK_1, ManeuverID.BLANK_2].includes(statusId as ManeuverID)) return
// 			if (event.type === "contextmenu") return this.object.actor.setManeuver(null)
// 			return this.object.actor.setManeuver(statusId as ManeuverID)
// 		}
//
// 		if (event.type === "click") {
// 			return this.object.actor.increaseCondition(statusId as ConditionID)
// 		} else if (event.type === "contextmenu") {
// 			if (event.ctrlKey)
// 				return this.object.actor.decreaseCondition(statusId as ConditionID, { forceRemove: true })
// 			else return this.object.actor.decreaseCondition(statusId as ConditionID)
// 		}
// 		return
// 	}
//
// 	protected _getConditionChoices(): TokenHUDConditionChoice[] {
// 		const conditions = game.gurps.ConditionManager.conditions
// 		return Object.keys(CONFIG.GURPS.statusEffects.conditions).reduce((acc: TokenHUDConditionChoice[], key) => {
// 			const condition = conditions.get(key)
// 			if (!condition) return acc
//
// 			const currentCondition = this.object.actor?.getCondition(key as ConditionID) ?? null
//
// 			acc.push({
// 				id: key,
// 				title: condition.name,
// 				src: condition.img,
// 				isActive: currentCondition !== null,
// 				// isOverlay: this.object.document.overlayEffect === condition.img,
// 				isOverlay: true,
// 				canLevel: condition.canLevel,
// 				level: currentCondition?.level ?? null,
// 				cssClass: "",
// 			})
// 			return acc
// 		}, [])
// 	}
//
// 	protected _getManeuverChoices(): TokenHUDStatusEffectChoice[] {
// 		const actor = this.object.actor
// 		if (!actor?.isOfType(ActorType.Character)) return []
//
// 		const maneuvers = game.gurps.ManeuverManager.maneuvers
// 		return Array.from(maneuvers.values()).map(e => {
// 			const title = [ManeuverID.BLANK_1, ManeuverID.BLANK_2, ""].includes(e.id)
// 				? ""
// 				: LocalizeGURPS.translations.gurps.maneuver[e.id]
//
// 			return {
// 				id: e.id,
// 				title,
// 				src: `systems/${SYSTEM_NAME}/assets/maneuver/${e.id}.webp`,
// 				isActive: actor.system.move.maneuver?.id === e.id,
// 				isOverlay: false,
// 				cssClass: "",
// 			}
// 		})
// 	}
//
// 	// Change visibility of maneuvers panel
// 	protected _toggleManeuvers(active: boolean): void {
// 		this._maneuvers = active
//
// 		const button = htmlQuery(this.element[0], `.control-icon[data-action="maneuvers"]`)
// 		if (button) {
// 			button.classList.toggle("active", active)
// 			const palette = htmlQuery(button, ".maneuvers")
// 			palette?.classList.toggle("active", active)
// 		}
// 	}
//
// 	protected override _onClickControl(event: PointerEvent): void {
// 		super._onClickControl(event)
// 		if (event.defaultPrevented) return
// 		const button = event.currentTarget as HTMLElement
// 		switch (button.dataset.action) {
// 			case "maneuvers":
// 				return this._onToggleManeuvers(event)
// 		}
// 	}
//
// 	protected _onToggleStatusEffects(event: JQuery.ClickEvent): void {
// 		event.preventDefault()
// 		this._toggleManeuvers(false)
// 		// this._toggleStatusEffects(!this._statusEffects)
// 	}
//
// 	protected _onToggleManeuvers(event: MouseEvent): void {
// 		event.preventDefault()
// 		this._maneuvers = (event.currentTarget as HTMLElement).classList.contains("active")
// 		// this._toggleStatusEffects(false)
// 		this._toggleManeuvers(!this._maneuvers)
// 	}
// }
//
// type TokenHUDConditionChoice = TokenHUDStatusEffectChoice & {
// 	canLevel: boolean
// 	level: number | null
// }
