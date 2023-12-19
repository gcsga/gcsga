import { ConditionID } from "@item/condition/data"
import { AttributeType } from "@module/attribute/data"
import { EFFECT_ACTION, SETTINGS, SYSTEM_NAME } from "@module/data"
import { LocalizeGURPS, prepareFormData } from "@util"
import { DnD } from "@util/drag_drop"
import { SettingsMenuGURPS } from "./menu"
import { defaultSettings } from "./defaults"

enum ListType {
	Attribute = "attributes",
	Thresholds = "attribute_thresholds",
	Effect = "effects",
	Enter = "enter",
	Leave = "leave",
}

export class DefaultAttributeSettings extends SettingsMenuGURPS {
	static override readonly namespace = "default_attributes"

	static override readonly SETTINGS = ["attributes", "effects"] as const

	static override get defaultOptions(): FormApplicationOptions {
		const options = super.defaultOptions
		options.classes.push("gurps", "settings-menu")

		return mergeObject(options, {
			title: `gurps.settings.${SETTINGS.DEFAULT_ATTRIBUTES}.name`,
			id: `${SETTINGS.DEFAULT_ATTRIBUTES}-settings`,
			template: `systems/${SYSTEM_NAME}/templates/system/settings/${SETTINGS.DEFAULT_ATTRIBUTES}.hbs`,
			width: 480,
			height: 600,
			submitOnClose: true,
			submitOnChange: true,
			closeOnSubmit: false,
			resizable: true,
			tabs: [
				{
					navSelector: "nav",
					contentSelector: "section.content",
					initital: "attributes",
				},
			],
		})
	}

	protected static override get settings(): Record<string, any> {
		return {
			attributes: {
				name: "",
				hint: "",
				type: Array,
				default: defaultSettings[SYSTEM_NAME][`${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`],
			},
			effects: {
				name: "",
				hint: "",
				type: Array,
				default: defaultSettings[SYSTEM_NAME][`${SETTINGS.DEFAULT_ATTRIBUTES}.effects`],
			},
		}
	}

	activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)
		// Html.find(".reset-all").on("click", event => this._onResetAll(event))
		html.find(".item").on("dragover", event => this._onDragItem(event))
		html.find(".add").on("click", event => this._onAddItem(event))
		html.find(".delete").on("click", event => this._onDeleteItem(event))
	}

	_onDataImport(event: JQuery.ClickEvent) {
		event.preventDefault()
	}

	_onDataExport(event: JQuery.ClickEvent) {
		event.preventDefault()
		const extension = "attr"
		const data = {
			type: "attribute_settings",
			version: 4,
			rows: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`),
		}
		return saveDataToFile(
			JSON.stringify(data, null, "\t"),
			extension,
			`${LocalizeGURPS.translations.gurps.settings.default_attributes.name}.${extension}`
		)
	}

	async _onAddItem(event: JQuery.ClickEvent) {
		event.preventDefault()
		event.stopPropagation()
		const attributes: any[] = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`)
		const effects: any[] = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`)
		const type: ListType = $(event.currentTarget).data("type")
		let new_id = ""
		if (type === ListType.Attribute)
			for (let n = 0; n < 26; n++) {
				const char = String.fromCharCode(97 + n)
				if (![...attributes].find(e => e.id === char)) {
					new_id = char
					break
				}
			}
		switch (type) {
			case ListType.Attribute:
				// TODO: account for possibility of all letters being taken
				attributes.push({
					type: AttributeType.Integer,
					id: new_id,
					name: "",
					attribute_base: "",
					cost_per_point: 0,
					cost_adj_percent_per_sm: 0,
				})
				await game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`, attributes)
				return this.render()
			case ListType.Thresholds:
				attributes[$(event.currentTarget).data("id")].thresholds ??= []
				attributes[$(event.currentTarget).data("id")].thresholds!.push({
					state: "",
					explanation: "",
					expression: "",
					ops: [],
				})
				await game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`, attributes)
				return this.render()
			case ListType.Effect:
				effects.push({
					attribute: "",
					state: "",
					enter: [],
					leave: [],
				})
				await game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`, effects)
				return this.render()
			case ListType.Enter:
			case ListType.Leave:
				effects[$(event.currentTarget).data("id")][type] ??= []
				effects[$(event.currentTarget).data("id")][type].push({
					id: ConditionID.Reeling,
					action: EFFECT_ACTION.ADD,
				})
				await game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`, effects)
				return this.render()
		}
	}

	private async _onDeleteItem(event: JQuery.ClickEvent) {
		event.preventDefault()
		event.stopPropagation()
		const attributes = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`)
		const effects = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`)
		const type: ListType = $(event.currentTarget).data("type")
		const index = Number($(event.currentTarget).data("index")) || 0
		const parent_index = Number($(event.currentTarget).data("pindex")) || 0
		switch (type) {
			case ListType.Attribute:
				attributes.splice(index, 1)
				await game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`, attributes)
				return this.render()
			case ListType.Thresholds:
				attributes[parent_index].thresholds?.splice(index, 1)
				await game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`, attributes)
				return this.render()
			case ListType.Effect:
				effects.splice(index, 1)
				await game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`, effects)
				return this.render()
			case ListType.Enter:
			case ListType.Leave:
				effects[parent_index][type]?.splice(index, 1)
				await game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`, effects)
				return this.render()
		}
	}

	async _onDragStart(event: DragEvent) {
		// TODO:update
		const item = $(event.currentTarget!)
		const type: Omit<ListType, ListType.Enter | ListType.Leave> = item.data("type")
		const index = Number(item.data("index"))
		const parent_index = Number(item.data("pindex")) || 0
		event.dataTransfer?.setData(
			"text/plain",
			JSON.stringify({
				type: type,
				index: index,
				parent_index: parent_index,
			})
		)
			; (event as any).dragType = type
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

	protected async _onDrop(event: DragEvent): Promise<unknown> {
		let dragData = DnD.getDragData(event, DnD.TEXT_PLAIN)
		let element = $(event.target!)
		if (!element.hasClass("item")) element = element.parent(".item")

		const attributes = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`)
		const effects = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`)
		const target_index = element.data("index")
		const above = element.hasClass("border-top")
		if (dragData.order === target_index) return this.render()
		if (above && dragData.order === target_index - 1) return this.render()
		if (!above && dragData.order === target_index + 1) return this.render()

		let container: any[] = []
		if (dragData.type === ListType.Attribute) container = attributes
		else if (dragData.type === ListType.Thresholds) container = attributes
		else if (dragData.type === ListType.Effect) container = effects
		if (!container) return

		let item
		if (dragData.type === ListType.Thresholds) {
			item = container[dragData.parent_index].thresholds.splice(dragData.index, 1)[0]
			container[dragData.parent_index].thresholds.splice(target_index, 0, item as any)
		} else {
			item = container.splice(dragData.index, 1)[0]
			container.splice(target_index, 0, item as any)
		}
		container.forEach((v: any, k: number) => {
			v.order = k
		})

		await game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`, attributes)
		await game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`, effects)
		return this.render()
	}

	override async getData(): Promise<any> {
		const attributes = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`)
		const effects = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`)
		return {
			attributes: attributes,
			effects: effects,
			actor: null,
			config: CONFIG.GURPS,
		}
	}

	protected override async _updateObject(_event: Event, formData: any): Promise<void> {
		const attributes = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`)
		const effects = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`)
		formData = prepareFormData(formData, { system: { settings: { attributes } }, effects })
		await game.settings.set(
			SYSTEM_NAME,
			`${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`,
			formData["system.settings.attributes"]
		)
		await game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`, formData.effects)
	}
}
