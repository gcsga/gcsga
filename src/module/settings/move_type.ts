import { SETTINGS, SYSTEM_NAME } from "@module/data"
import { MoveTypeDefObj, MoveTypeOverrideConditionType } from "@module/move_type"
import { AttributeBaseSettings } from "./attribute_base"
import { getNewAttributeId, prepareFormData } from "@util"
import { DnD } from "@util/drag_drop"

enum ListType {
	MoveType = "move_types",
	Overrides = "override",
}

export class DefaultMoveSettings extends AttributeBaseSettings {
	static override readonly namespace = SETTINGS.DEFAULT_MOVE_TYPES

	static override readonly SETTINGS = ["move_types"] as const

	_onDataImport(event: JQuery.ClickEvent) {
		event.preventDefault()
	}

	_onDataExport(event: JQuery.ClickEvent) {
		event.preventDefault()
	}

	getData(): Promise<any> {
		const obj = super.getData()
		console.log(obj)
		return obj
	}

	async _onAddItem(event: JQuery.ClickEvent) {
		event.preventDefault()
		event.stopPropagation()
		const move_types: MoveTypeDefObj[] = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`)
		const type: ListType = $(event.currentTarget).data("type")
		let new_id = ""
		if (type === ListType.MoveType)
			new_id = getNewAttributeId(move_types)
		switch (type) {
			case ListType.MoveType:
				move_types.push({
					id: new_id,
					name: "",
					move_type_base: "",
					cost_per_point: 0,
					overrides: [],
				})
				await game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`, move_types)
				return this.render()
			case ListType.Overrides:
				move_types[$(event.currentTarget).data("id")].overrides ??= []
				move_types[$(event.currentTarget).data("id")].overrides!.push({
					condition: {
						type: MoveTypeOverrideConditionType.Condition,
						qualifier: "",
					},
					move_type_base: "",
				})
				await game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`, move_types)
				return this.render()
		}
	}

	async _onDeleteItem(event: JQuery.ClickEvent): Promise<unknown> {
		event.preventDefault()
		event.stopPropagation()
		const move_types: MoveTypeDefObj[] = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`)
		const type: ListType = $(event.currentTarget).data("type")
		const index = Number($(event.currentTarget).data("index")) || 0
		const parent_index = Number($(event.currentTarget).data("pindex")) || 0
		switch (type) {
			case ListType.MoveType:
				move_types.splice(index, 1)
				await game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`, move_types)
				return this.render()
			case ListType.Overrides:
				move_types[parent_index].overrides?.splice(index, 1)
				await game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`, move_types)
				return this.render()
		}
	}

	protected async _onDrop(event: DragEvent): Promise<unknown> {
		let dragData = DnD.getDragData(event, DnD.TEXT_PLAIN)
		let element = $(event.target!)
		if (!element.hasClass("item")) element = element.parent(".item")

		const move_types: MoveTypeDefObj[] = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`)
		const target_index = element.data("index")
		const above = element.hasClass("border-top")
		if (dragData.order === target_index) return this.render()
		if (above && dragData.order === target_index - 1) return this.render()
		if (!above && dragData.order === target_index + 1) return this.render()

		let item
		if (dragData.type === ListType.Overrides) {
			item = move_types[dragData.parent_index].overrides.splice(dragData.index, 1)[0]
			move_types[dragData.parent_index].overrides.splice(target_index, 0, item as any)
		} else {
			item = move_types.splice(dragData.index, 1)[0]
			move_types.splice(target_index, 0, item as any)
		}
		move_types.forEach((v: any, k: number) => {
			v.order = k
		})

		await game.settings.set(SYSTEM_NAME, `${this.namespace}.move_types`, move_types)
		return this.render()
	}

	protected override async _updateObject(_event: Event, formData: any): Promise<void> {
		const move_types: MoveTypeDefObj[] = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`)
		formData = prepareFormData(formData, { system: { settings: { move_types } } })
		await game.settings.set(
			SYSTEM_NAME,
			`${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`,
			formData["system.settings.move_types"]
		)
	}
}
