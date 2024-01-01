import { ConditionID } from "@item/condition/data"
import { EFFECT_ACTION, SETTINGS, SYSTEM_NAME } from "@module/data"
import { LocalizeGURPS, getNewAttributeId, prepareFormData } from "@util"
import { DnD } from "@util/drag_drop"
import { AttributeBaseSettings } from "./attribute_base"
import { attribute } from "@util/enum"

enum ListType {
	Attribute = "attributes",
	Thresholds = "attribute_thresholds",
	Effect = "effects",
	Enter = "enter",
	Leave = "leave",
}

export class DefaultAttributeSettings extends AttributeBaseSettings {
	static override readonly namespace = SETTINGS.DEFAULT_ATTRIBUTES

	static override readonly SETTINGS = ["attributes", "effects"] as const

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
		if (type === ListType.Attribute) new_id = getNewAttributeId(attributes)
		switch (type) {
			case ListType.Attribute:
				attributes.push({
					type: attribute.Type.Integer,
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

	async _onDeleteItem(event: JQuery.ClickEvent): Promise<unknown> {
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
