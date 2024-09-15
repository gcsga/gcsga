// import { SETTINGS, SYSTEM_NAME } from "@data"
// import { PartialSettingsData, SettingsMenuGURPS } from "./menu.ts"
// import { htmlQuery, htmlQueryAll } from "@util/dom.ts"
// import { DnD, getNewAttributeId  } from "@util"
// import { defaultSettings } from "./defaults.ts"
// import { DropDataType } from "@module/apps/damage-calculator/damage-chat-message.ts"
// import { DropDataContext } from "@module/util/settings-helpers.ts"
// import { SettingsHelpers } from "@module/util/index.ts"
// import { ResourceTrackerDef } from "@system/resource-tracker/definition.ts"
//
// enum ListType {
// 	ResourceTracker = "resource_trackers",
// 	Thresholds = "tracker_thresholds",
// }
//
// type ConfigGURPSListName = (typeof ResourceTrackerSettings.SETTINGS)[number]
//
// export class ResourceTrackerSettings extends SettingsMenuGURPS {
// 	static override readonly namespace = SETTINGS.DEFAULT_RESOURCE_TRACKERS
//
// 	static override readonly SETTINGS = ["resource_trackers"]
//
// 	protected static override get settings(): Record<ConfigGURPSListName, PartialSettingsData> {
// 		return {
// 			resource_trackers: {
// 				prefix: SETTINGS.DEFAULT_RESOURCE_TRACKERS,
// 				name: "trackers temp",
// 				hint: "trackers hint temp",
// 				default: defaultSettings[SYSTEM_NAME][`${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`],
// 				type: Object,
// 				onChange: value => {
// 					console.log(value)
// 				},
// 			},
// 		}
// 	}
//
// 	get resourceTrackers(): ResourceTrackerDef[] {
// 		return game.settings
// 			.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`)
// 			.map(e => new ResourceTrackerDef(e))
// 	}
//
// 	override activateListeners($html: JQuery<HTMLElement>): void {
// 		super.activateListeners($html)
// 		const html = $html[0]
//
// 		for (const button of htmlQueryAll(html, "a[data-action^=add-]")) {
// 			const context: DropDataContext = {
// 				element: button,
// 				app: this,
// 				targetIndex: 0,
// 			}
//
// 			switch (button.dataset.action) {
// 				case "add-resource-tracker":
// 					button.addEventListener("click", () => SettingsHelpers.addResourceTracker(context))
// 					break
// 				case "add-resource-tracker-threshold":
// 					button.addEventListener("click", () => SettingsHelpers.addResourceTrackerThreshold(context))
// 					break
// 			}
// 		}
//
// 		for (const button of htmlQueryAll(html, "a[data-action^=remove-]")) {
// 			const context: DropDataContext = {
// 				element: button,
// 				app: this,
// 				targetIndex: 0,
// 			}
//
// 			switch (button.dataset.action) {
// 				case "remove-resource-tracker":
// 					button.addEventListener("click", () => SettingsHelpers.removeResourceTracker(context))
// 					break
// 				case "remove-resource-tracker-threshold":
// 					button.addEventListener("click", () => SettingsHelpers.removeResourceTrackerThreshold(context))
// 					break
// 			}
// 		}
// 	}
//
// 	protected _onDataImport(_event: MouseEvent): void {}
//
// 	protected _onDataExport(_event: MouseEvent): void {}
//
// 	protected _onAddItem(event: MouseEvent): void {
// 		const trackers = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`)
// 		const type: ListType = htmlQuery(event.target, "[data-type]")?.dataset.type as ListType
//
// 		let newID = ""
// 		switch (type) {
// 			case ListType.ResourceTracker:
// 				newID = getNewAttributeId(trackers)
// 				trackers.push({
// 					id: newID,
// 					base: "",
// 					name: "",
// 					full_name: "",
// 					max: 10,
// 					min: 0,
// 					isMaxEnforced: false,
// 					isMinEnforced: false,
// 					thresholds: [],
// 					order: trackers.length,
// 				})
// 				game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`, trackers)
// 				break
// 			case ListType.Thresholds: {
// 				const index = htmlQuery(event.target, "[data-id]")?.dataset.id
// 				if (index) {
// 					trackers[parseInt(index)].thresholds ??= []
// 					trackers[parseInt(index)].thresholds?.push({
// 						state: "",
// 						explanation: "",
// 						expression: "",
// 						ops: [],
// 					})
// 				}
// 				game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`, trackers)
// 				break
// 			}
// 		}
// 		this.render()
// 	}
//
// 	protected _onDeleteItem(event: MouseEvent): void {
// 		const trackers = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`)
// 		const type: ListType = htmlQuery(event.target, "[data-type]")?.dataset.type as ListType
//
// 		const index = parseInt(htmlQuery(event.target, "[data-index]")?.dataset.index ?? "-1")
// 		const pindex = parseInt(htmlQuery(event.target, "[data-pindex]")?.dataset.pindex ?? "-1")
// 		if (index === -1 || pindex === 1) return
//
// 		switch (type) {
// 			case ListType.ResourceTracker:
// 				trackers.splice(index, 1)
// 				game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`, trackers)
// 				break
// 			case ListType.Thresholds:
// 				trackers[pindex].thresholds?.splice(index, 1)
// 				game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`, trackers)
// 				break
// 		}
//
// 		this.render()
// 	}
//
// 	protected override _onDrop(event: DragEvent): void {
// 		const dragData = DnD.getDragData(event, DnD.TEXT_PLAIN)
//
// 		if (dragData.type === DropDataType.Damage) return
// 		if (dragData.type === DropDataType.Item) return
// 		if (dragData.type === DropDataType.HitLocation) return
// 		if (dragData.type === DropDataType.SubTable) return
// 		if (dragData.type === DropDataType.Attribute) return
// 		if (dragData.type === DropDataType.Effect) return
// 		if (dragData.type === DropDataType.AttributeThreshold) return
// 		if (dragData.type === DropDataType.MoveType) return
// 		if (dragData.type === DropDataType.MoveTypeOverride) return
//
// 		let element = event.currentTarget
// 		if (!(element instanceof HTMLElement)) return console.error("Drop event target is not valid.")
// 		while (!element.classList.contains("item")) {
// 			element = element.parentElement
// 			if (!(element instanceof HTMLElement)) return console.error("Drop event target is not valid.")
// 		}
//
// 		const targetIndex = parseInt(element.dataset.index ?? "")
// 		if (isNaN(targetIndex)) return console.error("Drop target index is not valid", element)
//
// 		const above = element.classList.contains("border-top")
// 		if (above && dragData.order === targetIndex - 1) return
// 		if (!above && dragData.order === targetIndex + 1) return
//
// 		const context: DropDataContext = {
// 			element,
// 			app: this,
// 			targetIndex,
// 		}
//
// 		switch (dragData.type) {
// 			case DropDataType.ResourceTracker:
// 				return SettingsHelpers.onDropResourceTracker(dragData, context)
// 			case DropDataType.ResourceTrackerThreshold:
// 				return SettingsHelpers.onDropResourceTrackerThreshold(dragData, context)
// 		}
// 	}
//
// 	// protected override async _updateObject(_event: Event, formData: Record<string, unknown>): Promise<void> {
// 	// 	const resource_trackers = game.settings.get(
// 	// 		SYSTEM_NAME,
// 	// 		`${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`,
// 	// 	)
// 	// 	formData = prepareFormData(formData, { system: { settings: { resource_trackers } } })
// 	// 	game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`, resource_trackers)
// 	// }
// }
