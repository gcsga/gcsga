import { RollModifier, SYSTEM_NAME, UserFlags } from "@module/data"
import { ModifierBucket } from "./button"
import { PDF } from "@module/pdf"

export class ModifierBucketWindow extends Application {

	// Common mod categories currently open
	categoriesOpen: boolean[] = Array(10).fill(false)

	// Current value of text input field
	value = ""

	parent: ModifierBucket

	constructor(parent: ModifierBucket) {
		super()
		this.parent = parent
	}

	static get defaultOptions(): ApplicationOptions {
		return mergeObject(super.defaultOptions, {
			template: `systems/${SYSTEM_NAME}/templates/modifier-bucket/window.hbs`,
			popOut: false,
			minimiazable: false,
			resizable: false,
			id: "ModifierBucket",
			scrollY: ["#categories .content"]
		})
	}


	activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)

		// Get position
		const button = $("#modifier-bucket-button")
		const buttonTop = button.position()?.top ?? 0
		const buttonLeft = (button.position()?.left || 0) + 220 ?? 0
		let buttonWidth = parseFloat(button.css("width").replace("px", ""))
		const width = html.width() || 640
		let height = parseFloat(html.css("height").replace("px", ""))
		let left = Math.max(buttonLeft + buttonWidth / 2 - width / 2, 10)
		html.css("left", `${left}px`)
		html.css("top", `${buttonTop - height - 10}px`)

		// Focus the textbox on show
		const searchbar = html.find(".searchbar")
		searchbar.trigger("focus")

		// Detect changes to input
		// searchbar.on("keydown", event => this._keyDown(event))

		// Modifier Deleting
		// html.find(".active").on("click", event => this.removeModifier(event))
		// html.find(".player").on("click", event => this.sendToPlayer(event))
		// html.find(".modifier").on("click", event => this._onClickModifier(event))
		html.find(".collapsible").on("click", event => this._onCollapseToggle(event))
		html.find(".ref").on("click", event => PDF.handle(event))
	}

	protected async _onCollapseToggle(event: JQuery.ClickEvent): Promise<unknown> {
		event.preventDefault()
		const index = parseInt($(event.currentTarget).find(".dropdown-toggle").data("index"))
		this.categoriesOpen[index] = !this.categoriesOpen[index]
		return this.render()
	}

	static async recalculateModTotal(user: StoredDocument<User> | null): Promise<unknown> {
		if (!user) return
		let total = 0
		const mods: RollModifier[] = (user.getFlag(SYSTEM_NAME, UserFlags.ModifierStack) as RollModifier[]) ?? []
		if (mods.length > 0)
			for (const m of mods) {
				total += m.modifier
			}
		await user.setFlag(SYSTEM_NAME, UserFlags.ModifierTotal, total)
	}

	getData(options?: Partial<ApplicationOptions> | undefined): MaybePromise<object> {
		const modStack = game.user.getFlag(SYSTEM_NAME, UserFlags.ModifierStack) ?? []

		const commonMods = CONFIG.GURPS.commonMods

		commonMods.forEach((e: any, i: number) => {
			e.open = this.categoriesOpen[i]
		})

		const genericMods = [-5, -4, -3, -2, -1, +1, +2, +3, +4, +5].map(e => {
			return { modifier: e }
		})

		const players = game.users ?? []

		return mergeObject(super.getData(options), {
			value: this.value,
			players,
			commonMods,
			genericMods,
			meleeMods: CONFIG.GURPS.meleeMods,
			rangedMods: CONFIG.GURPS.rangedMods,
			defenseMods: CONFIG.GURPS.defenseMods,
			currentMods: modStack,
		})
	}

}
