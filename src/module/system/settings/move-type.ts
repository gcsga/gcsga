import { PartialSettingsData, SettingsMenuGURPS } from "./menu.ts"
import { htmlQuery, htmlQueryAll } from "@util/dom.ts"
import { DnD, getNewAttributeId, prepareFormData } from "@util"
import { defaultSettings } from "./defaults.ts"
import { SETTINGS, SYSTEM_NAME } from "@data"
import { DropDataType } from "@module/apps/damage-calculator/damage-chat-message.ts"
import { MoveTypeDefObj, MoveTypeOverrideConditionType } from "@system"
import { DropDataContext } from "@module/util/settings-helpers.ts"
import { SettingsHelpers } from "@module/util/index.ts"

enum ListType {
	MoveType = "move_types",
	Overrides = "override",
}

type ConfigGURPSListName = (typeof MoveSettings.SETTINGS)[number]

export class MoveSettings extends SettingsMenuGURPS {
	static override readonly namespace = SETTINGS.DEFAULT_MOVE_TYPES

	static override readonly SETTINGS = ["move_types"] as const

	protected static override get settings(): Record<ConfigGURPSListName, PartialSettingsData> {
		return {
			move_types: {
				prefix: SETTINGS.DEFAULT_MOVE_TYPES,
				name: "move temp",
				hint: "move hint temp",
				default: defaultSettings[SYSTEM_NAME][`${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`],
				type: Object,
				onChange: value => {
					console.log(value)
				},
			},
		}
	}

	get moveTypes(): MoveTypeDefObj[] {
		return game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`)
	}

	override activateListeners($html: JQuery<HTMLElement>): void {
		super.activateListeners($html)
		const html = $html[0]

		for (const button of htmlQueryAll(html, "a[data-action^=add-]")) {
			const context: DropDataContext = {
				element: button,
				app: this,
				targetIndex: 0,
			}

			switch (button.dataset.action) {
				case "add-move-type":
					button.addEventListener("click", () => SettingsHelpers.addMoveType(context))
					break
				case "add-move-type-override":
					button.addEventListener("click", () => SettingsHelpers.addMoveTypeOverride(context))
					break
			}
		}

		for (const button of htmlQueryAll(html, "a[data-action^=remove-]")) {
			const context: DropDataContext = {
				element: button,
				app: this,
				targetIndex: 0,
			}

			switch (button.dataset.action) {
				case "remove-move-type":
					button.addEventListener("click", () => SettingsHelpers.removeMoveType(context))
					break
				case "remove-move-type-override":
					button.addEventListener("click", () => SettingsHelpers.removeMoveTypeOverride(context))
					break
			}
		}
	}

	protected _onDataImport(_event: MouseEvent): void {}

	protected _onDataExport(_event: MouseEvent): void {}

	protected _onAddItem(event: MouseEvent): void {
		const move_types = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`)
		const type: ListType = htmlQuery(event.target, "[data-type]")?.dataset.type as ListType

		let newID = ""
		switch (type) {
			case ListType.MoveType:
				newID = getNewAttributeId(move_types)
				move_types.push({
					id: newID,
					name: "",
					base: "",
					cost_per_point: 0,
					overrides: [],
				})
				game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`, move_types)
				break
			case ListType.Overrides: {
				const index = htmlQuery(event.target, "[data-id]")?.dataset.id
				if (index) {
					move_types[parseInt(index)].overrides ??= []
					move_types[parseInt(index)].overrides?.push({
						condition: {
							type: MoveTypeOverrideConditionType.Condition,
							qualifier: "",
						},
						base: "",
					})
				}
				game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`, move_types)
				break
			}
		}
		this.render()
	}

	protected _onDeleteItem(event: MouseEvent): void {
		const move_types = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`)
		const type: ListType = htmlQuery(event.target, "[data-type]")?.dataset.type as ListType

		const index = parseInt(htmlQuery(event.target, "[data-index]")?.dataset.index ?? "-1")
		const pindex = parseInt(htmlQuery(event.target, "[data-pindex]")?.dataset.pindex ?? "-1")
		if (index === -1 || pindex === 1) return

		switch (type) {
			case ListType.MoveType:
				move_types.splice(index, 1)
				game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`, move_types)
				break
			case ListType.Overrides:
				move_types[pindex].overrides?.splice(index, 1)
				game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`, move_types)
				break
		}

		this.render()
	}

	protected override _onDrop(event: DragEvent): void {
		const dragData = DnD.getDragData(event, DnD.TEXT_PLAIN)

		if (dragData.type === DropDataType.Damage) return
		if (dragData.type === DropDataType.Item) return
		if (dragData.type === DropDataType.HitLocation) return
		if (dragData.type === DropDataType.SubTable) return
		if (dragData.type === DropDataType.Attribute) return
		if (dragData.type === DropDataType.Effect) return
		if (dragData.type === DropDataType.AttributeThreshold) return
		if (dragData.type === DropDataType.ResourceTracker) return
		if (dragData.type === DropDataType.ResourceTrackerThreshold) return

		let element = event.currentTarget
		if (!(element instanceof HTMLElement)) return console.error("Drop event target is not valid.")
		while (!element.classList.contains("item")) {
			element = element.parentElement
			if (!(element instanceof HTMLElement)) return console.error("Drop event target is not valid.")
		}

		const targetIndex = parseInt(element.dataset.index ?? "")
		if (isNaN(targetIndex)) return console.error("Drop target index is not valid", element)

		const above = element.classList.contains("border-top")
		if (above && dragData.order === targetIndex - 1) return
		if (!above && dragData.order === targetIndex + 1) return

		const context: DropDataContext = {
			element,
			app: this,
			targetIndex,
		}

		switch (dragData.type) {
			case DropDataType.MoveType:
				return SettingsHelpers.onDropMoveType(dragData, context)
			case DropDataType.MoveTypeOverride:
				return SettingsHelpers.onDropMoveTypeOverride(dragData, context)
		}
	}

	protected override async _updateObject(_event: Event, formData: Record<string, unknown>): Promise<void> {
		const move_types = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`)
		formData = prepareFormData(formData, { system: { settings: { move_types } } })
		game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`, move_types)
	}
	// async _onAddItem(event: JQuery.ClickEvent) {
	// 	event.preventDefault()
	// 	event.stopPropagation()
	// 	const move_types: MoveTypeDefObj[] = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`)
	// 	const type: ListType = $(event.currentTarget).data("type")
	// 	let new_id = ""
	// 	if (type === ListType.MoveType) new_id = getNewAttributeId(move_types)
	// 	switch (type) {
	// 		case ListType.MoveType:
	// 			move_types.push({
	// 				id: new_id,
	// 				name: "",
	// 				move_type_base: "",
	// 				cost_per_point: 0,
	// 				overrides: [],
	// 			})
	// 			await game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`, move_types)
	// 			return this.render()
	// 		case ListType.Overrides:
	// 			move_types[$(event.currentTarget).data("id")].overrides ??= []
	// 			move_types[$(event.currentTarget).data("id")].overrides!.push({
	// 				condition: {
	// 					type: MoveTypeOverrideConditionType.Condition,
	// 					qualifier: "",
	// 				},
	// 				move_type_base: "",
	// 			})
	// 			await game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`, move_types)
	// 			return this.render()
	// 	}
	// }
	//
	// async _onDeleteItem(event: JQuery.ClickEvent): Promise<unknown> {
	// 	event.preventDefault()
	// 	event.stopPropagation()
	// 	const move_types: MoveTypeDefObj[] = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`)
	// 	const type: ListType = $(event.currentTarget).data("type")
	// 	const index = Number($(event.currentTarget).data("index")) || 0
	// 	const parent_index = Number($(event.currentTarget).data("pindex")) || 0
	// 	switch (type) {
	// 		case ListType.MoveType:
	// 			move_types.splice(index, 1)
	// 			await game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`, move_types)
	// 			return this.render()
	// 		case ListType.Overrides:
	// 			move_types[parent_index].overrides?.splice(index, 1)
	// 			await game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`, move_types)
	// 			return this.render()
	// 	}
	// }
	//
	// protected async _onDrop(event: DragEvent): Promise<unknown> {
	// 	const dragData = DnD.getDragData(event, DnD.TEXT_PLAIN)
	// 	let element = $(event.target!)
	// 	if (!element.hasClass("item")) element = element.parent(".item")
	//
	// 	const move_types: MoveTypeDefObj[] = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`)
	// 	const target_index = element.data("index")
	// 	const above = element.hasClass("border-top")
	// 	if (dragData.order === target_index) return this.render()
	// 	if (above && dragData.order === target_index - 1) return this.render()
	// 	if (!above && dragData.order === target_index + 1) return this.render()
	//
	// 	let item
	// 	if (dragData.type === ListType.Overrides) {
	// 		item = move_types[dragData.parent_index].overrides.splice(dragData.index, 1)[0]
	// 		move_types[dragData.parent_index].overrides.splice(target_index, 0, item as any)
	// 	} else {
	// 		item = move_types.splice(dragData.index, 1)[0]
	// 		move_types.splice(target_index, 0, item as any)
	// 	}
	// 	move_types.forEach((v: any, k: number) => {
	// 		v.order = k
	// 	})
	//
	// 	await game.settings.set(SYSTEM_NAME, `${this.namespace}.move_types`, move_types)
	// 	return this.render()
	// }
	//
	// protected override async _updateObject(_event: Event, formData: any): Promise<void> {
	// 	const move_types: MoveTypeDefObj[] = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`)
	// 	formData = prepareFormData(formData, { system: { settings: { move_types } } })
	// 	await game.settings.set(
	// 		SYSTEM_NAME,
	// 		`${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`,
	// 		formData["system.settings.move_types"],
	// 	)
	// }
}
