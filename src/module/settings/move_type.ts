import { PartialSettingsData, SettingsMenuGURPS } from "./menu.ts"
import { htmlClosest, htmlQuery } from "@util/dom.ts"
import { getNewAttributeId, prepareFormData } from "@util"
import { MoveTypeOverrideConditionType } from "@sytem/move_type/data.ts"
import { DnD } from "@util/drag_drop.ts"
import { DropDataType } from "@module/apps/damage_calculator/damage_chat_message.ts"
import { defaultSettings } from "./defaults.ts"
import { SETTINGS, SYSTEM_NAME } from "@data"

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
					move_type_base: "",
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
						move_type_base: "",
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
		const element = htmlClosest(event.target, ".item")
		if (!element) return

		const move_types = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`)
		const index = parseInt(element.dataset.index ?? "-1")
		if (index === -1) return
		const above = element.classList.contains("border-top")

		if (dragData.type === DropDataType.Item || dragData.type === DropDataType.Damage) return
		if (dragData.order === index) return
		if (above && dragData.order === index - 1) return
		if (!above && dragData.order === index + 1) return

		switch (dragData.type) {
			case DropDataType.MoveType: {
				const item = move_types.splice(dragData.index, 1)[0]
				move_types.splice(index, 0, item)
				break
			}
			case DropDataType.Overrides: {
				const item = move_types[dragData.parent_index].overrides?.splice(dragData.index, 1)[0]
				if (!item) break
				move_types[dragData.parent_index].overrides?.splice(index, 0, item)
				break
			}
		}

		game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`, move_types)
		this.render()
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
