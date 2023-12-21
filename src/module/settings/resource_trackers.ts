import { SETTINGS, SYSTEM_NAME } from "@module/data"
import { getNewAttributeId, prepareFormData } from "@util"
import { DnD } from "@util/drag_drop"
import { ResourceTrackerDefObj } from "@module/resource_tracker/data"
import { AttributeBaseSettings } from "./attribute_base"

enum ListType {
	ResourceTracker = "resource_trackers",
	Thresholds = "tracker_thresholds",
}

export class DefaultResourceTrackerSettings extends AttributeBaseSettings {
	static override readonly namespace = SETTINGS.DEFAULT_RESOURCE_TRACKERS

	static override readonly SETTINGS = ["resource_trackers"]

	_onDataImport(event: JQuery.ClickEvent) {
		event.preventDefault()
	}

	_onDataExport(event: JQuery.ClickEvent) {
		event.preventDefault()
	}

	async _onAddItem(event: JQuery.ClickEvent) {
		event.preventDefault()
		event.stopPropagation()
		const resource_trackers: ResourceTrackerDefObj[] = game.settings.get(
			SYSTEM_NAME,
			`${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`
		)
		const type: ListType = $(event.currentTarget).data("type")
		let new_id = ""
		if (type === ListType.ResourceTracker) new_id = getNewAttributeId(resource_trackers)
		switch (type) {
			case ListType.ResourceTracker:
				resource_trackers.push({
					id: new_id,
					name: "",
					full_name: "",
					max: 10,
					min: 0,
					isMaxEnforced: false,
					isMinEnforced: false,
					thresholds: [],
				})
				await game.settings.set(SYSTEM_NAME, `${this.namespace}.resource_trackers`, resource_trackers)
				return this.render()
			case ListType.Thresholds:
				resource_trackers[$(event.currentTarget).data("id")].thresholds ??= []
				resource_trackers[$(event.currentTarget).data("id")].thresholds!.push({
					state: "",
					explanation: "",
					expression: "",
					ops: [],
				})
				await game.settings.set(SYSTEM_NAME, `${this.namespace}.resource_trackers`, resource_trackers)
				return this.render()
		}
	}

	async _onDeleteItem(event: JQuery.ClickEvent) {
		event.preventDefault()
		event.stopPropagation()
		const resource_trackers: ResourceTrackerDefObj[] = game.settings.get(
			SYSTEM_NAME,
			`${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`
		)
		const type: "resource_trackers" | "tracker_thresholds" = $(event.currentTarget).data("type")
		const index = Number($(event.currentTarget).data("index")) || 0
		const parent_index = Number($(event.currentTarget).data("pindex")) || 0
		switch (type) {
			case "resource_trackers":
				resource_trackers.splice(index, 1)
				await game.settings.set(SYSTEM_NAME, `${this.namespace}.resource_trackers`, resource_trackers)
				return this.render()
			case "tracker_thresholds":
				resource_trackers[parent_index].thresholds?.splice(index, 1)
				await game.settings.set(SYSTEM_NAME, `${this.namespace}.resource_trackers`, resource_trackers)
				return this.render()
		}
	}

	protected async _onDrop(event: DragEvent): Promise<unknown> {
		let dragData = DnD.getDragData(event, DnD.TEXT_PLAIN)
		let element = $(event.target!)
		if (!element.hasClass("item")) element = element.parent(".item")

		const resource_trackers: ResourceTrackerDefObj[] = game.settings.get(
			SYSTEM_NAME,
			`${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`
		)
		const target_index = element.data("index")
		const above = element.hasClass("border-top")
		if (dragData.order === target_index) return this.render()
		if (above && dragData.order === target_index - 1) return this.render()
		if (!above && dragData.order === target_index + 1) return this.render()

		let container: any[] = []
		if (dragData.type === "resource_trackers") container = resource_trackers
		else if (dragData.type === "tracker_thresholds") container = resource_trackers
		if (!container) return

		let item
		if (dragData.type.includes("_thresholds")) {
			item = container[dragData.parent_index].thresholds.splice(dragData.index, 1)[0]
			container[dragData.parent_index].thresholds.splice(target_index, 0, item as any)
		} else {
			item = container.splice(dragData.index, 1)[0]
			container.splice(target_index, 0, item as any)
		}
		container.forEach((v: any, k: number) => {
			v.order = k
		})

		await game.settings.set(SYSTEM_NAME, `${this.namespace}.resource_trackers`, resource_trackers)
		return this.render()
	}

	protected override async _updateObject(_event: Event, formData: any): Promise<void> {
		const resource_trackers = await game.settings.get(SYSTEM_NAME, `${this.namespace}.resource_trackers`)
		formData = prepareFormData(formData, { system: { settings: { resource_trackers } } })
		await game.settings.set(
			SYSTEM_NAME,
			`${this.namespace}.resource_trackers`,
			formData["system.settings.resource_trackers"]
		)
	}
}
