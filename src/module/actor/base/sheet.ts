import { ItemType, SYSTEM_NAME } from "@module/data"
import { DamageChat } from "@module/damage_calculator/damage_chat_message"
import { DnD } from "@util/drag_drop"
import { ActorGURPS, ItemGURPS } from "@module/config"
import { PropertiesToSource } from "types/types/helperTypes"
import { ItemDataBaseProperties } from "types/foundry/common/data/data.mjs/itemData"
import { LastActor } from "@util"
import { ContainerGURPS, ItemFlags } from "@item"
import { DocumentSheetConfigGURPS } from "./config"

type DispatchFunctions = Record<string, (arg: any) => void>

export class ActorSheetGURPS extends ActorSheet {
	declare object: ActorGURPS

	readonly dropDispatch: DispatchFunctions = {
		[DamageChat.TYPE]: this.actor.handleDamageDrop.bind(this.actor),
	}

	static override get defaultOptions(): ActorSheet.Options {
		const options = ActorSheet.defaultOptions
		mergeObject(options, {
			classes: ["gurps", "actor"],
		})
		return options
	}

	activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)
		html.on("click", () => LastActor.set(this.actor))
	}

	protected override _onDrop(event: DragEvent): void {
		if (!event?.dataTransfer) return

		let dragData = DnD.getDragData(event, DnD.TEXT_PLAIN)

		if (this.dropDispatch[dragData.type]) this.dropDispatch[dragData.type](dragData.payload)

		super._onDrop(event)
	}

	async emulateItemDrop(data: any) {
		const item = (await fromUuid(data.uuid)) as Item
		if (!item) return
		return this._onDropItemCreate({ ...item.toObject() } as any)
	}

	// DragData handling
	protected override async _onDropItem(
		event: DragEvent,
		data: ActorSheet.DropData.Item & { uuid: string }
	): Promise<unknown> {
		const top = Boolean($(".border-top").length)
		const inContainer = Boolean($(".border-in").length)
		const other = [...$(event.target!), ...$(event.target!).parents()]
			.map(e => (e as unknown as HTMLElement).id)
			.some(e => e === "other-equipment")

		$(".border-bottom").removeClass("border-bottom")
		$(".border-top").removeClass("border-top")
		$(".border-in").removeClass("border-in")

		if (!this.actor.isOwner) return false

		const importData = {
			type: data.type,
			uuid: data.uuid,
		}
		const item = await (Item.implementation as any).fromDropData(importData)
		const itemData = item.toObject()

		// Handle item sorting within the same Actor
		if (this.actor.uuid === item.actor?.uuid) {
			return this._onSortItem(event, itemData, { top, inContainer, other })
		}

		return this._onDropNewItem(event, item, { top, inContainer, other })
	}

	protected async _onDropNewItem(
		event: DragEvent,
		item: Item,
		options: { top: boolean; inContainer: boolean; other: boolean } = {
			top: false,
			inContainer: false,
			other: false,
		}
	): Promise<this> {
		let id: string | null = null
		let dropTarget = $(event.target!).closest(".desc[data-item-id]")
		id = dropTarget?.data("item-id") ?? null
		if (!id || options.inContainer) {
			await this._onDropNestedItemCreate([item], { id, other: options.other })
			return this.render()
		}

		const targetItem = this.actor.items.get(id) as any

		id = (this.actor.items.get(id) as any)?.container.id
		if (id === this.actor.id) id = null

		const newItems = await this._onDropNestedItemCreate([item], { id, other: options.other })

		const sortUpdates = SortingHelpers.performIntegerSort(newItems[0], {
			target: targetItem,
			siblings: targetItem.container.items.contents,
			sortBefore: options.top,
		}).map(u => {
			return {
				...u.update,
				_id: u.target._id,
			}
		})
		await this.actor?.updateEmbeddedDocuments("Item", sortUpdates)
		return this.render()
	}

	async _onDropNestedItemCreate(
		items: Item[],
		context: { id: string | null; other: boolean } = { id: null, other: false }
	): Promise<Item[]> {
		const itemData = items.map(e => {
			if ([ItemType.Equipment, ItemType.EquipmentContainer].includes(e.type as ItemType))
				return mergeObject(e.toObject(), {
					[`flags.${SYSTEM_NAME}.${ItemFlags.Container}`]: context.id,
					"system.other": context.other,
				})
			return mergeObject(e.toObject(), { [`flags.${SYSTEM_NAME}.${ItemFlags.Container}`]: context.id })
		})

		const newItems = await this.actor.createEmbeddedDocuments("Item", itemData, {
			render: false,
			temporary: false,
		})

		let totalItems = newItems
		for (let i = 0; i < items.length; i++) {
			if (items[i] instanceof ContainerGURPS && (items[i] as ContainerGURPS).items.size) {
				const parent = items[i] as ContainerGURPS
				const childItems = await this._onDropNestedItemCreate(parent.items.contents, {
					id: newItems[i].id,
					other: context.other,
				})
				totalItems = totalItems.concat(childItems)
			}
		}
		return totalItems
	}

	protected override async _onDragStart(event: DragEvent): Promise<void> {
		const list = event.currentTarget
		// If (event.target.classList.contains("contents-link")) return;

		// let itemData: any
		let dragData: any

		// Owned Items
		if ($(list as HTMLElement).data("item-id")) {
			const id = $(list as HTMLElement).data("item-id")
			const item = this.actor.items.get(id) ?? null
			dragData = {
				type: "Item",
				uuid: item?.uuid,
			}

			// Create custom drag image
			const dragImage = document.createElement("div")
			dragImage.innerHTML = await renderTemplate(`systems/${SYSTEM_NAME}/templates/actor/drag-image.hbs`, {
				name: `${item?.name}`,
				type: `${item?.type.replace("_container", "").replaceAll("_", "-")}`,
			})
			dragImage.id = "drag-ghost"
			dragImage.setAttribute("data-item", JSON.stringify(item?.toObject()))
			document.body.querySelectorAll("#drag-ghost").forEach(e => e.remove())
			document.body.appendChild(dragImage)
			const height = (document.body.querySelector("#drag-ghost") as HTMLElement).offsetHeight
			event.dataTransfer?.setDragImage(dragImage, 0, height / 2)
		}

		// Active Effect
		if ((list as HTMLElement).dataset.effectId) {
			const effect = this.actor.effects.get((list as HTMLElement).dataset.effectId!)
			dragData = (effect as any)?.toDragData()
		}

		// Set data transfer
		event.dataTransfer?.setData("text/plain", JSON.stringify(dragData))
	}

	protected override _onSortItem(
		event: DragEvent,
		itemData: PropertiesToSource<ItemDataBaseProperties>,
		options: { top: boolean; inContainer: boolean; other: boolean } = {
			top: false,
			inContainer: false,
			other: false,
		}
	): Promise<Item[]> | undefined {
		// Dragged item
		const sourceItem = this.actor.items.get(itemData._id!) as ItemGURPS
		if (!sourceItem) return

		// The table element where the dragged item was dropped
		const targetTableEl = [...$(event.target!).filter(".item-list"), ...$(event.target!).parents(".item-list")][0]
		if (!targetTableEl) return

		// The item element onto which the dragged item was dropped
		const targetItemEl = $(event.target!).closest(".desc[data-item-id]")
		// This should only happen when switching between carried and other equipment
		if (!targetItemEl) {
			if (![ItemType.Equipment, ItemType.EquipmentContainer].includes(sourceItem.type)) return // this should not happen
			if (sourceItem.getFlag(SYSTEM_NAME, ItemFlags.Other) !== options.other)
				return this.actor.updateEmbeddedDocuments("Item", [
					{ _id: sourceItem.id, [`flags.${SYSTEM_NAME}.${ItemFlags.Other}`]: options.other },
				]) as Promise<Item[]>
		}

		let targetItem = this.actor.items.get(targetItemEl.data("item-id")) as ItemGURPS
		let targetItemContainer = targetItem?.container
		// Dropping item into a container
		if (options.inContainer && targetItem instanceof ContainerGURPS) {
			targetItemContainer = targetItem
			targetItem = targetItemContainer.children.contents[0] ?? null
		}

		const siblingItems = targetItemContainer?.items.filter(
			e => e.id !== sourceItem.id && sourceItem.sameSection(e)
		) as ItemGURPS[]

		// target item and source item are not in the same table
		if (targetItem && !sourceItem.sameSection(targetItem)) return

		// Sort updates sorts all items within the same container
		const sortUpdates = SortingHelpers.performIntegerSort(sourceItem, {
			target: targetItem,
			siblings: siblingItems,
			sortBefore: options.top,
		})

		const updateData = sortUpdates.map(u => {
			return { ...u.update, _id: u.target._id } as { _id: string; [key: string]: any }
		})

		// Set container flag if containers are not the same
		if (sourceItem.container !== targetItemContainer)
			updateData[updateData.findIndex(e => e._id === sourceItem._id)][
				`flags.${SYSTEM_NAME}.${ItemFlags.Container}`
			] = targetItemContainer instanceof ContainerGURPS ? targetItemContainer.id : null

		// Set other flag for equipment
		if ([ItemType.Equipment, ItemType.EquipmentContainer].includes(sourceItem.type))
			updateData[updateData.findIndex(e => e._id === sourceItem._id)][`flags.${SYSTEM_NAME}.${ItemFlags.Other}`] =
				options.other

		return this.actor.updateEmbeddedDocuments("Item", updateData) as Promise<ItemGURPS[]>
	}

	// protected async _onSortItemOld(
	// 	event: DragEvent,
	// 	itemData: PropertiesToSource<ItemDataBaseProperties>,
	// 	options:
	// 		{ top: boolean; inContainer: boolean, other: boolean } =
	// 		{ top: false, inContainer: false, other: false }
	// ): Promise<Item[]> {
	// 	// TODO: currently this does not work if you are dropping an item onto a table with no items present
	// 	// also it is a mess and needs a rewrite anyway so, rewrite
	// 	console.log("_onSortItem")
	// 	const source: any = this.actor.items.get(itemData._id!)
	// 	let dropTarget = $(event.target!).closest(".desc[data-item-id]")
	// 	const id = dropTarget?.data("item-id")
	// 	let target: any = this.actor.items.get(id)
	// 	if (!target) return []
	// 	let parent: any = target?.container
	// 	let parents = target?.parents
	// 	if (options.inContainer) {
	// 		parent = target
	// 		target = parent.children.contents[0] ?? null
	// 	}
	// 	const siblings = (parent!.items as Collection<Item>).filter(
	// 		i => i.id !== source!.id && (source as any)!.sameSection(i)
	// 	)
	// 	if (target && !(source as any)?.sameSection(target)) return []

	// 	const sortUpdates = SortingHelpers.performIntegerSort(source, {
	// 		target: target,
	// 		siblings: siblings,
	// 		sortBefore: options.top,
	// 	})
	// 	const updateData = sortUpdates.map(u => {
	// 		const update = u.update
	// 			; (update as any)._id = u.target!._id
	// 		return update
	// 	}) as { _id: string; sort: number;[key: string]: any }[]

	// 	console.log(source, options)

	// 	console.log(updateData)

	// 	if (source && source.container !== parent) {
	// 		const id = updateData.findIndex(e => (e._id = source._id))
	// 		if (source.items && parents.includes(source)) return []
	// 		updateData[id][`flags.${SYSTEM_NAME}.${ItemFlags.Container}`] = parent instanceof Item ? parent.id : null
	// 	}
	// 	if ([ItemType.Equipment, ItemType.EquipmentContainer].includes(source.type)) {
	// 		const id = updateData.findIndex(e => (e._id = source._id))
	// 		console.log("other", options.other, id)
	// 		updateData[id]["system.other"] = options.other
	// 	}
	// 	return this.actor!.updateEmbeddedDocuments("Item", updateData) as unknown as Item[]
	// }

	protected _getHeaderButtons(): Application.HeaderButton[] {
		const all_buttons = super._getHeaderButtons()
		all_buttons.at(-1)!.label = ""
		all_buttons.at(-1)!.icon = "gcs-circled-x"
		return all_buttons
	}

	protected override _onConfigureSheet(event: JQuery.ClickEvent<any, any, any, any>): void {
		event.preventDefault()
		new DocumentSheetConfigGURPS(this.document, {
			top: this.position.top! + 40,
			left: this.position.left! + (this.position.width! - DocumentSheet.defaultOptions.width!) / 2,
		}).render(true)
	}
}
