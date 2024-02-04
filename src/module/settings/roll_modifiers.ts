import { RollModifier, SETTINGS, SYSTEM_NAME } from "@module/data/misc.ts"
import { PartialSettingsData, SettingsMenuGURPS } from "./menu.ts"
import { LocalizeGURPS, prepareFormData } from "@util"

type ConfigGURPSListName = (typeof RollModifierSettings.SETTINGS)[number]

export class RollModifierSettings extends SettingsMenuGURPS {
	static override readonly namespace = SETTINGS.DEFAULT_ATTRIBUTES

	static override readonly SETTINGS = ["modifiers"]

	static override get defaultOptions(): FormApplicationOptions {
		const options = super.defaultOptions
		options.classes.push("gurps")
		options.classes.push("settings-menu")

		return fu.mergeObject(options, {
			title: `gurps.settings.${this.namespace}.name`,
			id: `${this.namespace}-settings`,
			template: `systems/${SYSTEM_NAME}/templates/system/settings/${this.namespace}.hbs`,
			width: 480,
			height: "auto",
			submitOnClose: true,
			submitOnChange: true,
			closeOnSubmit: false,
			resizable: true,
		} as FormApplicationOptions)
	}

	protected static override get settings(): Record<ConfigGURPSListName, PartialSettingsData> {
		return {
			modifiers: {
				name: "",
				hint: "",
				type: Array,
				default: [],
			},
		}
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)
		html.find(".item").on("dragover", event => this._onDragItem(event))
		html.find(".add").on("click", event => this._onAddItem(event))
		html.find(".delete").on("click", event => this._onDeleteItem(event))
	}

	protected _onDataImport(_event: MouseEvent): void {}

	protected _onDataExport(_event: MouseEvent): void {}

	protected _onAddItem(event: JQuery.ClickEvent): void {
		event.preventDefault()
		event.stopPropagation()
		const modifiers: RollModifier[] = game.settings.get(
			SYSTEM_NAME,
			`${this.namespace}.modifiers`,
		) as RollModifier[]
		modifiers.push({
			id: LocalizeGURPS.translations.gurps.settings.roll_modifiers.default,
			modifier: 0,
		})
		game.settings.set(SYSTEM_NAME, `${this.namespace}.modifiers`, modifiers)
		this.render()
	}

	private async _onDeleteItem(event: JQuery.ClickEvent) {
		event.preventDefault()
		event.stopPropagation()
		const modifiers: RollModifier[] = game.settings.get(
			SYSTEM_NAME,
			`${this.namespace}.modifiers`,
		) as RollModifier[]
		const index = Number($(event.currentTarget).data("index")) || 0
		modifiers.splice(index, 1)
		await game.settings.set(SYSTEM_NAME, `${this.namespace}.modifiers`, modifiers)
		return this.render()
	}

	override _onDragStart(event: DragEvent): void {
		const item = $(event.currentTarget!)
		const index = Number(item.data("index"))
		event.dataTransfer?.setData(
			"text/plain",
			JSON.stringify({
				index: index,
			}),
		)
	}

	protected _onDragItem(event: JQuery.DragOverEvent): void {
		const element = $(event.currentTarget!)
		const heightAcross = (event.pageY! - element.offset()!.top) / element.height()!
		element.siblings(".item").removeClass("border-top").removeClass("border-bottom")
		if (heightAcross > 0.5) {
			element.removeClass("border-top")
			element.addClass("border-bottom")
		} else {
			element.removeClass("border-bottom")
			element.addClass("border-top")
		}
	}

	protected override async _onDrop(event: DragEvent): Promise<unknown> {
		const dragData = JSON.parse(event.dataTransfer!.getData("text/plain"))
		let element = $(event.target!)
		if (!element.hasClass("item")) element = element.parent(".item")

		const modifiers: RollModifier[] = game.settings.get(
			SYSTEM_NAME,
			`${this.namespace}.modifiers`,
		) as RollModifier[]
		const target_index = element.data("index")
		const above = element.hasClass("border-top")
		if (dragData.order === target_index) return this.render()
		if (above && dragData.order === target_index - 1) return this.render()
		if (!above && dragData.order === target_index + 1) return this.render()

		const item = modifiers.splice(dragData.index, 1)[0]
		modifiers.splice(target_index, 0, item)
		await game.settings.set(SYSTEM_NAME, `${this.namespace}.modifiers`, modifiers)
		return this.render()
	}

	protected override async _updateObject(_event: Event, formData: Record<string, unknown>): Promise<void> {
		const modifiers: RollModifier[] = game.settings.get(
			SYSTEM_NAME,
			`${this.namespace}.modifiers`,
		) as RollModifier[]
		formData = prepareFormData(formData, { modifiers: modifiers })
		await game.settings.set(SYSTEM_NAME, `${this.namespace}.modifiers`, formData.modifiers)
	}
}
