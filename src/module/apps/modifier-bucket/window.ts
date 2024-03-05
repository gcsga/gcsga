import { HOOKS, ModifierItem, RollModifier, RollModifierStack, SOCKET, SYSTEM_NAME } from "@data"
import { ModifierBucket } from "./button.ts"
import { UserFlags } from "@module/user/data.ts"
import { LocalizeGURPS, PDF } from "@util"
import { DialogGURPS } from "../dialog.ts"

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

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)

		// Get position
		const button = $("#modifier-bucket-button")
		const buttonTop = button.offset()?.top ?? 0
		const buttonLeft = button.position()?.left + 220
		const buttonWidth = parseFloat(button.css("width").replace("px", ""))
		const width = html.width() || 640
		const height = parseFloat(html.css("height").replace("px", ""))
		const left = Math.max(buttonLeft + buttonWidth / 2 - width / 2, 10)
		html.css("left", `${left}px`)
		html.css("top", `${buttonTop - height - 10}px`)

		// Focus the textbox on show
		const searchbar = html.find(".searchbar")
		searchbar.trigger("focus")

		// Detect changes to input
		// searchbar.on("keydown", event => this._keyDown(event))

		// Modifier Deleting
		html.find(".player").on("click", event => this._onSendToPlayer(event))
		html.find(".modifier").on("click", event => this._onClickModifier(event))
		html.find(".collapsible").on("click", event => this._onCollapseToggle(event))
		html.find(".ref").on("click", event => PDF.handle(event))

		// Save Current Bucket
		html.find("#save-current").on("click", event => this._onSaveCurrentStack(event))
		html.find("#stacks #dropdown-toggle").on("click", event => this._onStackCollapseToggle(event))
		html.find("#stacks .apply").on("click", event => this._onApplyStack(event))
		html.find("#stacks .apply").on("click", event => this._onApplyStack(event))
		html.find("#stacks .delete").on("click", event => this._onDeleteStack(event))
	}

	_onClickModifier(event: JQuery.ClickEvent): void {
		event.preventDefault()
		const modifier = $(event.currentTarget).data("modifier")
		return game.user.addModifier(modifier)
	}

	private async _onCollapseToggle(event: JQuery.ClickEvent): Promise<unknown> {
		event.preventDefault()
		const index = parseInt($(event.currentTarget).find(".dropdown-toggle").data("index"))
		this.categoriesOpen[index] = !this.categoriesOpen[index]
		return this.render()
	}

	private async _onStackCollapseToggle(event: JQuery.ClickEvent): Promise<unknown> {
		event.preventDefault()
		console.log("what")
		const savedStacks = (game.user.getFlag(SYSTEM_NAME, UserFlags.SavedStacks) as RollModifierStack[]) ?? []
		const stacks = this.stacksOpen
		stacks.push(...Array(savedStacks.length - stacks.length).fill(false))
		const index = parseInt(event.currentTarget.dataset.index)
		stacks[index] = !this.stacksOpen[index]
		this.stacksOpen = stacks
		return this.render()
	}

	private async _onSaveCurrentStack(event: JQuery.ClickEvent): Promise<void> {
		event.preventDefault()
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

	private async _onApplyStack(event: JQuery.ClickEvent): Promise<boolean> {
		event.preventDefault()
		const index = event.currentTarget.dataset.index
		const savedStacks = (game.user.getFlag(SYSTEM_NAME, UserFlags.SavedStacks) as RollModifierStack[]) ?? []
		await game.user.setFlag(SYSTEM_NAME, UserFlags.ModifierStack, savedStacks[index].items)
		return Hooks.call(HOOKS.AddModifier)
	}

	private async _onDeleteStack(event: JQuery.ClickEvent): Promise<boolean> {
		event.preventDefault()
		const index = event.currentTarget.dataset.index
		const savedStacks = (game.user.getFlag(SYSTEM_NAME, UserFlags.SavedStacks) as RollModifierStack[]) ?? []
		savedStacks.splice(index, 1)
		await game.user.setFlag(SYSTEM_NAME, UserFlags.SavedStacks, savedStacks)
		return Hooks.call(HOOKS.AddModifier)
	}

	private async _onSendToPlayer(event: JQuery.ClickEvent) {
		event.preventDefault()
		const id = $(event.currentTarget).data("user-id")
		const player = game.users?.get(id)
		if (!player) return
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
