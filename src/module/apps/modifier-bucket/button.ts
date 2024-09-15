import { RollType, SYSTEM_NAME, UserFlags } from "@data"
import { ModifierBucketWindow } from "./window.ts"
import { LastActor } from "@module/util/last-actor.ts"
import { BasicRoll } from "@module/dice/basic-roll.ts"

export class ModifierBucket extends Application {
	window: ModifierBucketWindow

	/**
	 * Debounce and slightly delayed request to re-render this panel. necessary for situations where it is not possible
	 * to properly wait for promises to resolve before refreshing the ui.
	 */
	refresh = foundry.utils.debounce(this.render, 100)

	override render(force?: boolean | undefined, options?: RenderOptions | undefined): this {
		if (this.window.rendered) this.window.render(force, options)
		return super.render(force, options)
	}

	constructor() {
		super()
		this.window = new ModifierBucketWindow(this)
	}

	static override get defaultOptions(): ApplicationOptions {
		return {
			...super.defaultOptions,
			popOut: false,
			minimizable: false,
			resizable: false,
			id: "modifier-bucket-button",
			template: `systems/${SYSTEM_NAME}/templates/modifier-bucket/button.hbs`,
			classes: ["modifier-button"],
		}
	}

	override _injectHTML(html: JQuery<HTMLElement>): void {
		if ($("body").find("#modifier-bucket-button").length === 0) {
			html.insertAfter($("body").find("#hotbar-page-controls"))
			this._element = html
		}
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)

		html[0].addEventListener("wheel", event => this._onMouseWheel(event), { passive: true })

		html.find("#modifier-bucket-button").on("click", event => this._onClick(event))
		html.find(".magnet").on("click", event => this._onMagnetClick(event))
		html.find(".trash").on("click", event => this._onTrashClick(event))

		html.find("#dice-roller").on("click", event => this._onDiceClick(event))
		html.find("#dice-roller").on("contextmenu", event => this._onDiceContextMenu(event))

		html.find("#current-actor").on("click", event => this._OnCurrentActorClick(event))
	}

	override async getData(options?: Partial<ApplicationOptions> | undefined): Promise<object> {
		const total = game.user.modifierTotal
		const buttonMagnet = game.user?.getFlag(SYSTEM_NAME, UserFlags.ModifierSticky) === true ? "sticky" : ""
		let buttonColor = "total-white"
		if (total > 0) buttonColor = "total-green"
		if (total < 0) buttonColor = "total-red"
		const showDice = true
		const currentActor = game.user?.isGM ? await LastActor.get() : null

		return fu.mergeObject(super.getData(options), {
			id: this.id,
			total,
			buttonColor,
			buttonMagnet,
			showDice,
			imgDice: `systems/${SYSTEM_NAME}/assets/3d6.webp`,
			currentActor: currentActor ? currentActor.name : null,
		})
	}

	// Increase/Decrease modifier by 1 with the mouse wheel
	async _onMouseWheel(event: WheelEvent): Promise<this> {
		const delta = Math.round(event.deltaY / -100)
		game.user.addModifier({
			id: "",
			modifier: delta,
			tags: [],
		})
		return this.render()
	}

	// Open/close the modifier bucket
	_onClick(event: JQuery.ClickEvent): unknown {
		event.preventDefault()
		if (this.window.rendered) {
			return this.window.close()
			// game.ModifierList.fadeOut()
		} else {
			return this.window.render(true)
			// game.ModifierList.fadeIn()
		}
	}

	// Toggle modifier bucket magnet
	private async _onMagnetClick(event: JQuery.ClickEvent): Promise<unknown> {
		event.preventDefault()
		event.stopPropagation()
		const sticky = game.user?.getFlag(SYSTEM_NAME, UserFlags.ModifierSticky) ?? false
		await game.user?.setFlag(SYSTEM_NAME, UserFlags.ModifierSticky, !sticky)
		return this.render()
	}

	// Roll 3d6
	private async _onDiceClick(event: JQuery.ClickEvent): Promise<void> {
		event.preventDefault()
		const roll = BasicRoll.create("3d6")
		roll.toMessage()
		// return RollGURPS.handleRoll(game.user, game.user.character, {
		// 	name: "",
		// 	actor: game.user.character?.id ?? "",
		// 	user: game.user.id,
		// 	type: RollType.Generic,
		// 	formula: "3d6",
		// 	hidden: event.ctrlKey,
		// })
	}

	// Roll 1d6
	async _onDiceContextMenu(event: JQuery.ContextMenuEvent): Promise<void> {
		event.preventDefault()
		return RollGURPS.handleRoll(game.user, null, {
			name: "",
			actor: game.user.character?.id ?? "",
			user: game.user.id,
			type: RollType.Generic,
			formula: "1d6",
			hidden: event.ctrlKey,
		})
	}

	async _OnCurrentActorClick(event: JQuery.ClickEvent): Promise<unknown> {
		event.preventDefault()
		return LastActor.get().then(actor => actor?.sheet?.render(true))
	}

	_onTrashClick(event: JQuery.ClickEvent): unknown {
		event.preventDefault()
		event.stopPropagation()
		this.clear()
		return this.render()
	}

	async clear(): Promise<unknown> {
		await game.user?.setFlag(SYSTEM_NAME, UserFlags.ModifierStack, [])
		game.gurps.modifierList.render()
		return this.render(true)
	}
}
