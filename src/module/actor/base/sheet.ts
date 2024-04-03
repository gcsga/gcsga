import { AbstractContainerGURPS, ItemGURPS } from "@item"
import { ActorGURPS } from "./document.ts"
import { DamagePayload, DropDataType } from "@module/apps/damage-calculator/damage-chat-message.ts"
import { DnD, ErrorGURPS, htmlClosest, htmlQueryAll } from "@util"
import { ItemFlags, ItemType, SORTABLE_BASE_OPTIONS, SYSTEM_NAME } from "@module/data/constants.ts"
import { ItemSections, itemSections } from "./item-collection-map.ts"
import Sortable from "sortablejs"
import { isContainerCycle } from "@item/abstract-container/helpers.ts"
import { ItemSourceGURPS } from "@item/data/index.ts"

type DispatchFunctions = Record<string, (arg: DamagePayload) => void>

/**
 * Extend the basic ActorSheet class for GURPS functionality
 * This sheet is an Abstract layer which is not used.
 * @category Actor
 */
abstract class ActorSheetGURPS<TActor extends ActorGURPS> extends ActorSheet<TActor, ItemGURPS> {
	static override get defaultOptions(): ActorSheetOptions {
		const data = super.defaultOptions
		data.classes.push("actor", "gurps")
		return data
	}

	readonly dropDispatch: DispatchFunctions = {
		[DropDataType.Damage]: this.actor.handleDamageDrop.bind(this.actor),
	}

	override async getData(options: Partial<ActorSheetOptions> = this.options): Promise<ActorSheetDataGURPS<TActor>> {
		const sheetData = await super.getData(options as ActorSheetOptions)
		return {
			...sheetData,
		}
	}

	override activateListeners($html: JQuery): void {
		super.activateListeners($html)
		const html = $html[0]

		for (const toggle of htmlQueryAll(html, "li[data-item-id] > .data a.dropdown-toggle")) {
			toggle.addEventListener("click", ev => {
				const itemId = htmlClosest(ev.currentTarget, "[data-item-id]")?.dataset.itemId
				if (!itemId) throw ErrorGURPS("Invalid dropdown operation: No item ID found")
				const item = this.actor.items.get(itemId)
				if (!item) throw ErrorGURPS(`Invalid dropdown operation: No item found with ID: "${itemId}"`)
				if (!item.isOfType("container"))
					throw ErrorGURPS(`Invalid dropdown operation: Target item is not a container`)
				item.update({ "system.open": !item.system.open })
			})
		}

		this.#activateItemDragDrop(html)
		this.#activateContextMenu(html)
		this._applyBanding()
	}

	#activateItemDragDrop(html: HTMLElement): void {
		for (const list of htmlQueryAll(html, "ul[data-item-list]")) {
			const options: Sortable.Options = {
				...SORTABLE_BASE_OPTIONS,
				scroll: list,
				setData: (dataTransfer, dragEl) => {
					const item = this.actor.items.get(dragEl.dataset.itemId, { strict: true })
					dataTransfer.setData(DnD.TEXT_PLAIN, JSON.stringify(item.toDragData()))
				},
				onMove: event => this.#onMoveItem(event),
				onEnd: async event => {
					await this.#onDropItem(event)
					this._applyBanding()
				},
			}

			new Sortable(list, options)
		}
	}

	#activateContextMenu(html: HTMLElement): void {
		for (const itemRow of htmlQueryAll(html, "li[data-item-id]")) {
			const itemId = itemRow.dataset.itemId
			if (!itemId) throw ErrorGURPS("Invalid dropdown operation: No item ID found")
			const item = this.actor.items.get(itemId)
			if (!item) throw ErrorGURPS(`Invalid dropdown operation: No item found with ID: "${itemId}"`)
			ContextMenu.create(this, $(itemRow), "*", item.getContextMenuItems())
		}
	}

	#onMoveItem(event: Sortable.MoveEvent): boolean {
		const isSeparateSheet = htmlClosest(event.target, "form") !== htmlClosest(event.related, "form")
		if (!this.isEditable || isSeparateSheet) return false

		// Item being dragged
		const sourceItem = this.actor.items.get(event.dragged?.dataset.itemId, { strict: true })

		// Remove container highlights
		for (const row of htmlQueryAll(this.form, "li[data-is-container]")) {
			row.classList.remove("drop-highlight")
		}

		// Grab section (traits, equipment, other equipment) item is being dragged into
		const targetSection = htmlClosest(event.related, "ul[data-item-types]")?.dataset.itemTypes?.split(",") ?? []
		if (targetSection.length === 0) return false

		const targetItemRow = htmlClosest(event.related, "li[data-item-id]")
		const targetItem = this.actor.items.get(targetItemRow?.dataset.itemId ?? "")
		const targetContainer = targetItem?.container
		if (targetContainer) {
			const targetContainerRow = htmlClosest(targetItemRow, "li[data-is-container]")
			if (isContainerCycle(sourceItem, targetContainer)) return false
			if (targetContainerRow) {
				targetContainerRow.classList.add("drop-highlight")
			}
		}

		// Do not allow dragging if item cannot go into this section
		if (targetSection.includes(sourceItem.type)) return true
		return false
	}

	async #onDropItem(event: Sortable.SortableEvent & { originalEvent?: DragEvent }): Promise<void> {
		const isSeparateSheet = htmlClosest(event.target, "form") !== htmlClosest(event.originalEvent?.target, "form")
		if (!this.isEditable || isSeparateSheet) return

		const containerRowData = htmlQueryAll(this.form, "li[data-is-container] > .data")
		for (const row of containerRowData) {
			row.classList.remove("drop-highlight")
		}

		const targetSection =
			htmlClosest(event.originalEvent?.target, "ul[data-item-section]")?.dataset.itemSection ?? ""
		const isItemSection = (type: unknown): type is ItemSections => {
			return typeof type === "string" && itemSections.some(e => e === type)
		}
		if (!isItemSection(targetSection)) return

		const collection = this.actor.itemCollections[targetSection] as Collection<ItemGURPS<TActor>>
		const sourceItem = collection.get(event.item.dataset.itemId, { strict: true })
		const itemsInList = htmlQueryAll(htmlClosest(event.item, "ul"), ":scope > li").map(li =>
			li.dataset.itemId === sourceItem.id ? sourceItem : collection.get(li.dataset.itemId, { strict: true }),
		)

		const targetItemId = htmlClosest(event.originalEvent?.target, "li[data-item-id]")?.dataset.itemId ?? ""
		const targetItem = this.actor.items.get(targetItemId)

		const containerElem = htmlClosest(event.item, "ul[data-container-id]")
		const containerId = containerElem?.dataset.containerId ?? ""
		const container = targetItem?.isOfType("container") ? targetItem : collection.get(containerId)
		if (container && !container.isOfType("container")) {
			throw ErrorGURPS("Unexpected non-container retrieved while sorting items")
		}

		if (container && isContainerCycle(sourceItem, container)) {
			this.render()
			return
		}

		const sourceIndex = itemsInList.indexOf(sourceItem)
		const targetBefore = itemsInList[sourceIndex - 1]
		const targetAfter = itemsInList[sourceIndex + 1]
		const siblings = [...itemsInList]
		siblings.splice(siblings.indexOf(sourceItem), 1)
		type SortingUpdate = {
			_id: string
			"flags.gcsga.container": string | null
			sort?: number
		}
		const sortingUpdates: SortingUpdate[] = SortingHelpers.performIntegerSort(sourceItem, {
			siblings,
			target: targetBefore ?? targetAfter,
			sortBefore: !targetBefore,
		}).map(u => ({ _id: u.target.id, "flags.gcsga.container": container?.id ?? null, sort: u.update.sort }))
		if (!sortingUpdates.some(u => u._id === sourceItem.id)) {
			sortingUpdates.push({ _id: sourceItem.id, "flags.gcsga.container": container?.id ?? null })
		}

		await this.actor.updateEmbeddedDocuments("Item", sortingUpdates)
	}

	protected _applyBanding(): void {
		const html = this.element[0]

		for (const list of htmlQueryAll(html, "#embeds [data-item-list]:not([data-container-id])")) {
			let banding = true
			for (const item of htmlQueryAll(list, "li")) {
				banding = !banding
				item.style.backgroundColor = ""
				item.style.color = ""
				if (banding) {
					item.style.backgroundColor = "rgb(var(--color-banding))"
					item.style.color = "rgb(var(--color-on-banding))"
				}
			}
		}
	}

	protected override _onDrop(event: DragEvent): Promise<boolean | void> {
		if (!event?.dataTransfer) return super._onDrop(event)

		const dragData = DnD.getDragData(event, DnD.TEXT_PLAIN)

		if (dragData.type === DropDataType.Damage) this.dropDispatch[dragData.type](dragData.payload)

		return super._onDrop(event)
	}

	protected override async _onDropItem(
		event: DragEvent,
		data: DropCanvasData<"Item", ItemGURPS> & { itemType: ItemType },
	): Promise<ItemGURPS[]> {
		event.preventDefault()
		const item = await ItemGURPS.fromDropData(data)
		if (!item) return []

		// const contents: ItemGURPS[] = []
		// if (item.isOfType("abstract-container"))
		// contents.push(...AbstractContainerGURPS.contentFromDropData(data, newId))
		// 	if (item.actor?.uuid === this.actor.uuid)
		// 		// Drops from the same actor are handled by Sortable
		// 		return []

		if (item.actor && item.isOfType(ItemType.Equipment, ItemType.EquipmentContainer)) {
			// TODO check implementation
			await this.moveEquipmentBetweenActors(
				event,
				item.actor.id,
				item.actor?.token?.id ?? null,
				this.actor.id,
				this.actor.token?.id ?? null,
				item.id,
			)
			return [item]
		}

		return this._handleDroppedItem(event, item)
	}

	/**
	 * Prevent a Foundry permission error from being thrown when a player moves an item from and to the sheet of the
	 * same lootable actor.
	 */
	protected override async _onSortItem(event: DragEvent, itemData: ItemSourceGURPS): Promise<ItemGURPS[]> {
		return this.actor.isOwner ? super._onSortItem(event, itemData) : []
	}

	/**
	 * GURPS specific method called by _onDropItem() when this is a new item that needs to be dropped into the actor
	 * that isn't already on the actor or transferring to another actor.
	 */
	protected async _handleDroppedItem(
		event: DragEvent,
		item: ItemGURPS<ActorGURPS | null>,
	): Promise<ItemGURPS<ActorGURPS | null>[]> {
		const itemSource = item.toObject()

		const containerId = htmlClosest(event.target, "li[data-is-container]")?.dataset.itemId?.trim() || null
		const container = this.actor.items.find(container => container.id === containerId)
		if (container) {
			itemSource.flags[SYSTEM_NAME] = fu.mergeObject(itemSource.flags[SYSTEM_NAME] ?? {}, {})
			itemSource.flags[SYSTEM_NAME][ItemFlags.Container] = containerId
		}

		if (item.isOfType("abstract-container")) {
			return this._onDropContainerCreate(item, containerId)
		}

		// Creating a new item: clear the _id via cloning it
		return this._onDropItemCreate(new Item.implementation(itemSource).clone().toObject()) as Promise<
			ItemGURPS<TActor>[]
		>
	}

	protected async _onDropContainerCreate(
		item: AbstractContainerGURPS,
		containerId: string | null,
	): Promise<ItemGURPS<TActor>[]> {
		const newId = fu.randomID()
		const itemSource = item
			.clone({ _id: newId, flags: { [SYSTEM_NAME]: { [ItemFlags.Container]: containerId } } })
			.toObject()
		const items: ItemGURPS["_source"][] = [itemSource]
		console.log(itemSource.name, itemSource._id)
		items.push(...AbstractContainerGURPS.cloneContents(item, newId))

		return this.actor.createEmbeddedDocuments("Item", items, { keepId: true }) as unknown as ItemGURPS<TActor>[]
	}

	/**
	 * Moves an item between two actors' inventories.
	 * @param event         Event that fired this method.
	 * @param sourceActorId ID of the actor who originally owns the item.
	 * @param targetActorId ID of the actor where the item will be stored.
	 * @param itemId           ID of the item to move between the two actors.
	 */
	async moveEquipmentBetweenActors(
		event: DragEvent,
		sourceActorId: string,
		sourceTokenId: string | null,
		targetActorId: string,
		targetTokenId: string | null,
		itemId: string,
	): Promise<void> {
		const sourceActor = canvas.scene?.tokens.get(sourceTokenId ?? "")?.actor ?? game.actors.get(sourceActorId)
		const targetActor = canvas.scene?.tokens.get(targetTokenId ?? "")?.actor ?? game.actors.get(targetActorId)
		const item = sourceActor?.items.get(itemId)

		if (!sourceActor || !targetActor) {
			throw ErrorGURPS("Unexpected missing actor(s)")
		}
		if (!item?.isOfType(ItemType.Equipment, ItemType.EquipmentContainer)) {
			throw ErrorGURPS("Missing or invalid item")
		}

		const containerId = htmlClosest(event.target, "[data-is-container]")?.dataset.containerId?.trim()
		const sourceItemQuantity = item.system.quantity

		// If more than one item can be moved, show a popup to ask how many to move
		if (sourceItemQuantity > 1) {
			// const defaultQuantity = isPurchase
			//     ? isAmmunition
			//         ? Math.min(10, sourceItemQuantity)
			//         : 1
			//     : sourceItemQuantity;
			// const popup = new MoveLootPopup(
			//     sourceActor,
			//     { quantity: { max: sourceItemQuantity, default: defaultQuantity }, lockStack: !stackable, isPurchase },
			//     (quantity, newStack) => {
			//         sourceActor.transferItemToActor(targetActor, item, quantity, containerId, newStack);
			//     },
			// );
			//
			// popup.render(true);
		} else {
			sourceActor.transferEquipmentToActor(targetActor, item, 1, containerId)
		}
	}
}

interface ActorSheetGURPS<TActor extends ActorGURPS> extends ActorSheet<TActor, ItemGURPS> {}

interface ActorSheetDataGURPS<TActor extends ActorGURPS> extends ActorSheetData<TActor> {}

export { ActorSheetGURPS }
export type { ActorSheetDataGURPS }
