import { HOOKS, ModifierItem, RollModifier, RollModifierStack, SOCKET, SYSTEM_NAME } from "@data"
import { ModifierBucket } from "./button.ts"
import { UserFlags } from "@module/user/data.ts"
import { LocalizeGURPS, htmlQuery, htmlQueryAll } from "@util"
import { DialogGURPS } from "../dialog.ts"
import { PDF } from "@module/util/index.ts"

export class ModifierBucketWindow extends Application {
	refresh = foundry.utils.debounce(this.render, 100)

	// Common mod categories currently open
	stacksOpen: boolean[] = []

	stackEditing: number = -1

	categoriesOpen: boolean[] = Array(10).fill(false)

	// Current value of text input field
	value = ""

	parent: ModifierBucket

	constructor(parent: ModifierBucket) {
		super()
		this.parent = parent
	}

	static override get defaultOptions(): ApplicationOptions {
		return {
			...super.defaultOptions,
			template: `systems/${SYSTEM_NAME}/templates/modifier-bucket/window.hbs`,
			popOut: false,
			minimizable: false,
			resizable: false,
			id: "ModifierBucket",
			scrollY: ["#categories .content"],
		}
	}

	override activateListeners($html: JQuery): void {
		super.activateListeners($html)
		const html = $html[0]

		// Get position
		const button = htmlQuery(document, "#modifier-bucket-button")
		if (!button) {
			return console.error("Modifier bucket button not found!")
		}

		const buttonTop = button.offsetTop
		const buttonLeft = button.offsetLeft + 220
		const buttonWidth = button.offsetWidth
		const width = html.offsetWidth || 640
		const height = html.offsetHeight
		const left = Math.max(buttonLeft + buttonWidth / 2 - width / 2, 10)

		console.log(buttonLeft, buttonWidth, width, left)
		console.log(buttonLeft + buttonWidth / 2 - width / 2)

		html.style.setProperty("left", `${left}px`)
		html.style.setProperty("top", `${buttonTop - height - 10}px`)

		// Focus the textbox on show
		const searchbar = htmlQuery(html, ".searchbar")
		if (searchbar) {
			searchbar.focus()
		}

		// Detect changes to input
		// searchbar.on("keydown", event => this._keyDown(event))

		// Modifier Deleting
		for (const player of htmlQueryAll(html, "a.player"))
			player.addEventListener("click", ev => this._onSendToPlayer(ev))
		for (const modifier of htmlQueryAll(html, "a.modifier"))
			modifier.addEventListener("click", ev => this._onClickModifier(ev))
		for (const section of htmlQueryAll(html, ".collapsible"))
			section.addEventListener("click", ev => this._onCollapseToggle(ev))
		for (const ref of htmlQueryAll(html, "a.ref")) ref.addEventListener("click", ev => PDF.handle(ev))

		// Save Current Bucket
		htmlQuery(html, "#save-current")?.addEventListener("click", _ => this._onSaveCurrentStack())

		const stacks = htmlQuery(html, "#stacks")
		if (!stacks) return
		for (const section of htmlQueryAll(stacks, "#dropdown-toggle"))
			section.addEventListener("click", ev => this._onStackCollapseToggle(ev))
		for (const section of htmlQueryAll(stacks, ".apply"))
			section.addEventListener("click", ev => this._onApplyStack(ev))
		for (const section of htmlQueryAll(stacks, ".delete"))
			section.addEventListener("click", ev => this._onDeleteStack(ev))
	}

	_onClickModifier(event: MouseEvent): void {
		const element = event.currentTarget ?? null
		if (!(element instanceof HTMLLinkElement)) return

		const modifier = JSON.parse(element.dataset.modifier ?? "")

		return game.user.addModifier(modifier)
	}

	private async _onCollapseToggle(event: MouseEvent): Promise<unknown> {
		const element = event.currentTarget ?? null
		if (!(element instanceof HTMLLinkElement)) return

		const index = parseInt(htmlQuery(element, ".dropdown-toggle")?.dataset.index ?? "")
		if (isNaN(index)) return console.error("Invalid index")

		this.categoriesOpen[index] = !this.categoriesOpen[index]
		return this.render()
	}

	private async _onStackCollapseToggle(event: MouseEvent): Promise<unknown> {
		const element = event.currentTarget ?? null
		if (!(element instanceof HTMLLinkElement)) return

		const savedStacks = (game.user.getFlag(SYSTEM_NAME, UserFlags.SavedStacks) as RollModifierStack[]) ?? []
		const stacks = this.stacksOpen
		stacks.push(...Array(savedStacks.length - stacks.length).fill(false))
		const index = parseInt(element.dataset.index ?? "")
		stacks[index] = !this.stacksOpen[index]
		this.stacksOpen = stacks
		return this.render()
	}

	private async _onSaveCurrentStack(): Promise<void> {
		const modStack = game.user.getFlag(SYSTEM_NAME, UserFlags.ModifierStack) as RollModifier[]
		setTimeout(async () => {
			new DialogGURPS(
				{
					title: LocalizeGURPS.translations.gurps.system.modifier_bucket.save_current,
					content: await renderTemplate(`systems/${SYSTEM_NAME}/templates/modifier-bucket/name.hbs`, {}),
					buttons: {
						apply: {
							icon: '<i class="fas fa-check"></i>',
							label: LocalizeGURPS.translations.gurps.system.modifier_bucket.save_apply,
							callback: async (html: HTMLElement | JQuery<HTMLElement>) => {
								const form = $(html).find("form")
								let name = form.find("input").val()
								if (!name || name === "")
									name = LocalizeGURPS.translations.gurps.system.modifier_bucket.untitled_stack
								const savedStacks =
									(game.user.getFlag(SYSTEM_NAME, UserFlags.SavedStacks) as RollModifierStack[]) ?? []
								savedStacks.push({
									title: name,
									items: modStack,
								})
								await game.user.setFlag(SYSTEM_NAME, UserFlags.SavedStacks, savedStacks)
								Hooks.call(HOOKS.AddModifier)
							},
						},
						no: {
							icon: '<i class="fas fa-times"></i>',
							label: LocalizeGURPS.translations.gurps.system.modifier_bucket.save_cancel,
						},
					},
					default: "apply",
				},
				{
					width: 400,
				},
			).render(true)
		}, 200)
	}

	private async _onApplyStack(event: MouseEvent): Promise<boolean> {
		const element = event.currentTarget ?? null
		if (!(element instanceof HTMLLinkElement)) return false

		const index = parseInt(element.dataset.index ?? "")
		if (isNaN(index)) {
			console.error("Invalid index")
			return false
		}

		const savedStacks = game.user.flags[SYSTEM_NAME][UserFlags.SavedStacks]
		await game.user.setFlag(SYSTEM_NAME, UserFlags.ModifierStack, savedStacks[index].items)
		return Hooks.call(HOOKS.AddModifier)
	}

	private async _onDeleteStack(event: MouseEvent): Promise<boolean> {
		const element = event.currentTarget ?? null
		if (!(element instanceof HTMLLinkElement)) return false

		const index = parseInt(element.dataset.index ?? "")
		if (isNaN(index)) {
			console.error("Invalid index")
			return false
		}

		const savedStacks = game.user.flags[SYSTEM_NAME][UserFlags.SavedStacks]
		savedStacks.splice(index, 1)
		await game.user.setFlag(SYSTEM_NAME, UserFlags.SavedStacks, savedStacks)
		return Hooks.call(HOOKS.AddModifier)
	}

	private async _onSendToPlayer(event: MouseEvent): Promise<void> {
		const element = event.currentTarget ?? null
		if (!(element instanceof HTMLLinkElement)) return

		const id = element.dataset.userId
		if (!id) return console.error("No id provided")
		const player = game.users?.get(id)
		if (!player) return console.error(`Player with id "${id}" does not exist.`)

		const modStack = game.user?.getFlag(SYSTEM_NAME, UserFlags.ModifierStack)
		await player.setFlag(SYSTEM_NAME, UserFlags.ModifierStack, modStack)
		game.socket?.emit(`system.${SYSTEM_NAME}`, { type: SOCKET.UPDATE_BUCKET, users: [player.id] })
	}

	override getData(options?: Partial<ApplicationOptions> | undefined): object | Promise<object> {
		const modStack = game.user.getFlag(SYSTEM_NAME, UserFlags.ModifierStack) ?? []
		const savedStacks = (game.user.getFlag(SYSTEM_NAME, UserFlags.SavedStacks) as RollModifierStack[]) ?? []

		const commonMods = CONFIG.GURPS.commonMods

		commonMods.forEach((e: { title: string; items: ModifierItem[]; open?: boolean }, i: number) => {
			e.open = this.categoriesOpen[i]
		})

		savedStacks.forEach((e: RollModifierStack, i: number) => {
			e.editing = this.stackEditing === i
			e.open = this.stacksOpen[i]
		})

		const genericMods = [-5, -4, -3, -2, -1, +1, +2, +3, +4, +5].map(e => {
			return { modifier: e }
		})

		const players = game.users ?? []

		return fu.mergeObject(super.getData(options), {
			value: this.value,
			stackEditing: this.stackEditing,
			players,
			commonMods,
			genericMods,
			savedStacks,
			meleeMods: CONFIG.GURPS.meleeMods,
			rangedMods: CONFIG.GURPS.rangedMods,
			defenseMods: CONFIG.GURPS.defenseMods,
			currentMods: modStack,
		})
	}
}
