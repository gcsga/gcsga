enum ListType {
	ResourceTracker = "resource_trackers",
	Thresholds = "tracker_thresholds",
}

import { SETTINGS, SYSTEM_NAME } from "@module/data/misc.ts"
import { PartialSettingsData, SettingsMenuGURPS } from "./menu.ts"
import { htmlClosest, htmlQuery } from "@util/dom.ts"
import { getNewAttributeId, prepareFormData } from "@util"
import { DnD } from "@util/drag_drop.ts"
import { DropDataType } from "@module/apps/damage_calculator/damage_chat_message.ts"
import { defaultSettings } from "./defaults.ts"

//
type ConfigGURPSListName = (typeof ResourceTrackerSettings.SETTINGS)[number]

export class ResourceTrackerSettings extends SettingsMenuGURPS {
	static override readonly namespace = SETTINGS.DEFAULT_RESOURCE_TRACKERS

	static override readonly SETTINGS = ["resource_trackers"]

	protected static override get settings(): Record<ConfigGURPSListName, PartialSettingsData> {
		return {
			resource_trackers: {
				prefix: SETTINGS.DEFAULT_RESOURCE_TRACKERS,
				name: "trackers temp",
				hint: "trackers hint temp",
				default: defaultSettings[SYSTEM_NAME][`${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`],
				type: Object,
				onChange: value => {
					console.log(value)
				},
			},
		}
	}

	protected _onDataImport(_event: MouseEvent): void {}

	protected _onDataExport(_event: MouseEvent): void {}

	protected _onAddItem(event: MouseEvent): void {
		const trackers = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`)
		const type: ListType = htmlQuery(event.target, "[data-type]")?.dataset.type as ListType

		let newID = ""
		switch (type) {
			case ListType.ResourceTracker:
				newID = getNewAttributeId(trackers)
				trackers.push({
					id: newID,
					name: "",
					full_name: "",
					max: 10,
					min: 0,
					isMaxEnforced: false,
					isMinEnforced: false,
					thresholds: [],
				})
				game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`, trackers)
				break
			case ListType.Thresholds: {
				const index = htmlQuery(event.target, "[data-id]")?.dataset.id
				if (index) {
					trackers[parseInt(index)].thresholds ??= []
					trackers[parseInt(index)].thresholds?.push({
						state: "",
						explanation: "",
						expression: "",
						ops: [],
					})
				}
				game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`, trackers)
				break
			}
		}
		this.render()
	}

	protected _onDeleteItem(event: MouseEvent): void {
		const trackers = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`)
		const type: ListType = htmlQuery(event.target, "[data-type]")?.dataset.type as ListType

		const index = parseInt(htmlQuery(event.target, "[data-index]")?.dataset.index ?? "-1")
		const pindex = parseInt(htmlQuery(event.target, "[data-pindex]")?.dataset.pindex ?? "-1")
		if (index === -1 || pindex === 1) return

		switch (type) {
			case ListType.ResourceTracker:
				trackers.splice(index, 1)
				game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`, trackers)
				break
			case ListType.Thresholds:
				trackers[pindex].thresholds?.splice(index, 1)
				game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`, trackers)
				break
		}

		this.render()
	}

	protected override _onDrop(event: DragEvent): void {
		const dragData = DnD.getDragData(event, DnD.TEXT_PLAIN)
		const element = htmlClosest(event.target, ".item")
		if (!element) return

		const trackers = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`)
		const index = parseInt(element.dataset.index ?? "-1")
		if (index === -1) return
		const above = element.classList.contains("border-top")

		if (dragData.type === DropDataType.Item || dragData.type === DropDataType.Damage) return
		if (dragData.order === index) return
		if (above && dragData.order === index - 1) return
		if (!above && dragData.order === index + 1) return

		switch (dragData.type) {
			case DropDataType.ResourceTrackers: {
				const item = trackers.splice(dragData.index, 1)[0]
				trackers.splice(index, 0, item)
				// trackers.forEach((v, k) => (v.order = k))
				break
			}
			case DropDataType.TrackerThresholds: {
				const item = trackers[dragData.parent_index].thresholds?.splice(dragData.index, 1)[0]
				if (!item) break
				trackers[dragData.parent_index].thresholds?.splice(index, 0, item)
				break
			}
		}

		game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`, trackers)
		this.render()
	}

	protected override async _updateObject(_event: Event, formData: Record<string, unknown>): Promise<void> {
		const resource_trackers = game.settings.get(
			SYSTEM_NAME,
			`${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`,
		)
		formData = prepareFormData(formData, { system: { settings: { resource_trackers } } })
		game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`, resource_trackers)
	}
}
