import { ConditionID, EFFECT_ACTION, SETTINGS, SYSTEM_NAME } from "@module/data/index.ts"
import { PartialSettingsData, SettingsMenuGURPS } from "./menu.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { htmlClosest, htmlQuery } from "@util/dom.ts"
import { getNewAttributeId, prepareFormData } from "@util/misc.ts"
import { attribute } from "@util/enum/attribute.ts"
import { DnD } from "@util/drag_drop.ts"
import { defaultSettings } from "./defaults.ts"
import { DropDataType } from "@module/apps/damage_calculator/damage_chat_message.ts"

enum ListType {
	Attribute = "attributes",
	Thresholds = "attribute_thresholds",
	Effect = "effects",
	Enter = "enter",
	Leave = "leave",
}

type ConfigGURPSListName = (typeof AttributeSettings.SETTINGS)[number]

export class AttributeSettings extends SettingsMenuGURPS {
	static override readonly namespace = SETTINGS.DEFAULT_ATTRIBUTES

	static override readonly SETTINGS = ["attributes", "effects"] as const

	protected static override get settings(): Record<ConfigGURPSListName, PartialSettingsData> {
		return {
			attributes: {
				prefix: SETTINGS.DEFAULT_ATTRIBUTES,
				name: "attributes temp",
				hint: "attributes hint temp",
				default: defaultSettings[SYSTEM_NAME][`${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`],
				type: Object,
				onChange: () => {},
			},
			effects: {
				prefix: SETTINGS.DEFAULT_ATTRIBUTES,
				name: "effects temp",
				hint: "effects hint temp",
				default: defaultSettings[SYSTEM_NAME][`${SETTINGS.DEFAULT_ATTRIBUTES}.effects`],
				type: Object,
				onChange: () => {},
			},
		}
	}

	static override get defaultOptions(): FormApplicationOptions {
		const options = super.defaultOptions
		return {
			...options,
			tabs: [
				{
					navSelector: "nav",
					contentSelector: "section.content",
					initial: "attributes",
				},
			],
			dragDrop: [
				{
					dragSelector: ".item-list .item .controls .drag",
					dropSelector: null,
				},
			],
		}
	}

	override activateListeners($html: JQuery<HTMLElement>): void {
		super.activateListeners($html)
		const html = $html[0]

		htmlQuery(html, ".item")?.addEventListener("dragover", event => this._onDragItem(event))
		htmlQuery(html, ".add")?.addEventListener("click", event => this._onAddItem(event))
		htmlQuery(html, ".delete")?.addEventListener("click", event => this._onDeleteItem(event))
	}

	protected _onDataImport(_event: MouseEvent): void {}

	protected _onDataExport(_event: MouseEvent): void {
		const extension = "attr"
		const data = {
			type: "attribute_settings",
			version: 4,
			rows: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`),
		}
		fu.saveDataToFile(
			JSON.stringify(data, null, "\t"),
			extension,
			`${LocalizeGURPS.translations.gurps.settings.default_attributes.name}.${extension}`,
		)
	}

	protected _onDragItem(event: DragEvent): void {
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

	protected _onAddItem(event: MouseEvent): void {
		const attributes = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`)
		const effects = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`)
		const type: ListType = htmlQuery(event.target, "[data-type]")?.dataset.type as ListType

		let newID = ""
		switch (type) {
			case ListType.Attribute:
				newID = getNewAttributeId(attributes)
				attributes.push({
					type: attribute.Type.Integer,
					id: newID,
					name: newID,
					attribute_base: "10",
					cost_per_point: 0,
					cost_adj_percent_per_sm: 0,
				})
				game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`, attributes)
				break
			case ListType.Effect:
				effects.push({
					attribute: "",
					state: "",
					enter: [],
					leave: [],
				})
				game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`, effects)
				break
			case ListType.Thresholds: {
				const index = htmlQuery(event.target, "[data-id]")?.dataset.id
				if (index) {
					attributes[parseInt(index)].thresholds ??= []
					attributes[parseInt(index)].thresholds?.push({
						state: "",
						explanation: "",
						expression: "",
						ops: [],
					})
				}
				game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`, attributes)
				break
			}
			case ListType.Enter:
			case ListType.Leave: {
				const index = htmlQuery(event.target, "[data-id]")?.dataset.id
				if (index) {
					effects[parseInt(index)][type] ??= []
					effects[parseInt(index)][type].push({
						id: ConditionID.Reeling,
						action: EFFECT_ACTION.ADD,
					})
					game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`, effects)
					break
				}
			}
		}
		this.render()
	}

	protected _onDeleteItem(event: MouseEvent): void {
		const attributes = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`)
		const effects = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`)
		const type: ListType = htmlQuery(event.target, "[data-type]")?.dataset.type as ListType

		const index = parseInt(htmlQuery(event.target, "[data-index]")?.dataset.index ?? "-1")
		const pindex = parseInt(htmlQuery(event.target, "[data-pindex]")?.dataset.pindex ?? "-1")
		if (index === -1 || pindex === 1) return

		switch (type) {
			case ListType.Attribute:
				attributes.splice(index, 1)
				game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`, attributes)
				break
			case ListType.Thresholds:
				attributes[pindex].thresholds?.splice(index, 1)
				game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`, attributes)
				break
			case ListType.Effect:
				effects.splice(index, 1)
				game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`, effects)
				break
			case ListType.Enter:
			case ListType.Leave:
				effects[pindex][type]?.splice(index, 1)
				game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`, effects)
				break
		}

		this.render()
	}

	protected override _onDrop(event: DragEvent): void {
		const dragData = DnD.getDragData(event, DnD.TEXT_PLAIN)
		const element = htmlClosest(event.target, ".item")
		if (!element) return

		const attributes = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`)
		const effects = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`)
		const index = parseInt(element.dataset.index ?? "-1")
		if (index === -1) return
		const above = element.classList.contains("border-top")

		if (dragData.type === DropDataType.Item || dragData.type === DropDataType.Damage) return
		if (dragData.order === index) return
		if (above && dragData.order === index - 1) return
		if (!above && dragData.order === index + 1) return

		switch (dragData.type) {
			case DropDataType.Attributes: {
				const item = attributes.splice(dragData.index, 1)[0]
				attributes.splice(index, 0, item)
				attributes.forEach((v, k) => (v.order = k))
				break
			}
			case DropDataType.Effects: {
				const item = effects.splice(dragData.index, 1)[0]
				effects.splice(index, 0, item)
				break
			}
			case DropDataType.AttributeThresholds: {
				const item = attributes[dragData.parent_index].thresholds?.splice(dragData.index, 1)[0]
				if (!item) break
				attributes[dragData.parent_index].thresholds?.splice(index, 0, item)
				break
			}
		}

		game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`, attributes)
		game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`, effects)
		this.render()
	}

	protected override async _updateObject(_event: Event, data: Record<string, unknown>): Promise<void> {
		const attributes = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`)
		const effects = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`)
		data = prepareFormData(data, { system: { settings: { attributes } }, effects })
		game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`, attributes)
		game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`, effects)
	}
}
