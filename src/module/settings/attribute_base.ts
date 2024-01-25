import { SETTINGS, SYSTEM_NAME } from "@module/data/misc.ts"
import { SettingsMenuGURPS } from "./menu.ts"
import { mergeObject } from "types/foundry/common/utils/helpers.js"

type AttributeBaseSettingField = {
	name: string
	hint: string
	type: typeof Array
	default: any[]
}

export abstract class AttributeBaseSettings extends SettingsMenuGURPS {
	static override readonly namespace: SETTINGS

	static override readonly SETTINGS: readonly string[] = [] as const

	static override get defaultOptions(): FormApplicationOptions {
		const options = super.defaultOptions
		options.classes.push("gurps", "settings-menu")

		return mergeObject(options, {
			title: `gurps.settings.${this.namespace}.name`,
			id: `${this.namespace}-settings`,
			template: `systems/${SYSTEM_NAME}/templates/system/settings/${this.namespace}.hbs`,
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
			dragDrop: [{ dragSelector: ".item-list .item .controls .drag", dropSelector: null }],
		})
	}

	protected static override get settings(): Record<string, AttributeBaseSettingField> {
		return this.SETTINGS.reduce(
			(array, value) => ({
				...array,
				[value]: {
					name: "",
					hint: "",
					type: Array,
					// @ts-expect-error all values willbe correct so this doesn't matter
					// but should probably fix at some point anyway
					default: defaultSettings[SYSTEM_NAME][`${this.namespace}.${value}`],
				},
			}),
			{},
		)
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)
		html.find(".item").on("dragover", event => this._onDragItem(event))
		html.find(".add").on("click", event => this._onAddItem(event))
		html.find(".delete").on("click", event => this._onDeleteItem(event))
	}

	_onDataImport(event: JQuery.ClickEvent) {
		event.preventDefault()
	}

	abstract _onAddItem(event: JQuery.ClickEvent): Promise<unknown>

	abstract _onDeleteItem(event: JQuery.ClickEvent): Promise<unknown>

	override async _onDragStart(event: DragEvent) {
		const item = $(event.currentTarget!)
		const type = item.data("type")
		const index = Number(item.data("index"))
		const parent_index = Number(item.data("pindex")) || 0
		event.dataTransfer?.setData(
			"text/plain",
			JSON.stringify({
				type: type,
				index: index,
				parent_index: parent_index,
			}),
		)
		;(event as any).dragType = type
		console.log(event.dataTransfer?.getData("text/plain"))
	}

	protected _onDragItem(event: JQuery.DragOverEvent): void {
		console.log("_onDragItem")
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

	override async getData(): Promise<any> {
		return (<typeof AttributeBaseSettings>this.constructor).SETTINGS.reduce(
			(array, value) => ({
				...array,
				[value]: game.settings.get(
					SYSTEM_NAME,
					`${(<typeof AttributeBaseSettings>this.constructor).namespace}.${value}` as any,
				),
			}),
			{
				actor: null,
				config: CONFIG.GURPS,
			},
		)
	}
}
