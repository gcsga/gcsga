import { ItemSheetDataGURPS, ItemSheetGURPS, ItemSheetOptions } from "@item/base/sheet.ts"
import { AbstractContainerGURPS } from "./document.ts"
import { DnD, ErrorGURPS, LocalizeGURPS, applyBanding, htmlClosest, htmlQuery, htmlQueryAll, objectHasKey } from "@util"
import { ItemFlags, ItemType, SORTABLE_BASE_OPTIONS, SYSTEM_NAME } from "@module/data/constants.ts"
import { createDragImage } from "@util/drag-image.ts"
import { ItemGURPS } from "@item"
import { ItemSourceGURPS } from "@item/data/index.ts"
import { SheetItem, SheetItemCollection } from "@item/helpers.ts"
import Sortable from "sortablejs"
import { isContainerCycle } from "./helpers.ts"
import { ItemItemSections, itemItemSections } from "./item-collection-map.ts"
import { ActorGURPS } from "@actor"

class AbstractContainerSheetGURPS<TItem extends AbstractContainerGURPS> extends ItemSheetGURPS<TItem> {
	static override get defaultOptions(): ItemSheetOptions {
		return {
			...super.defaultOptions,
			dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
		}
	}

	override activateListeners($html: JQuery): void {
		super.activateListeners($html)
		const html = $html[0]

		for (const toggle of htmlQueryAll(html, "[data-action=toggle-dropdown]")) {
			toggle.addEventListener("click", ev => {
				const element = ev.currentTarget
				if (!(element instanceof HTMLElement)) return

				const id = element.dataset.itemId ?? ""
				const item = this.item.deepContents.get(id)
				if (!item) return console.error(`No item found with id "${id}"`)
				if (!item.isOfType(ItemType.TraitModifierContainer, ItemType.EquipmentModifierContainer))
					return console.error(`Item "${item.name}" is not a container`)
				item.update({ "system.open": !item.system.open })
			})
		}

		for (const toggle of htmlQueryAll(html, "[data-action=toggle-enabled]")) {
			toggle.addEventListener("click", ev => {
				const element = ev.currentTarget
				if (!(element instanceof HTMLElement)) return

				const id = element.dataset.itemId ?? ""
				const item = this.item.deepContents.get(id)
				if (!item) return console.error(`No item found with id "${id}"`)
				if (!item.isOfType(ItemType.TraitModifier, ItemType.EquipmentModifier))
					return console.error(`Item "${item.name}" is not a modifier`)
				item.update({ "system.disabled": !item.system.disabled })
			})
		}

		for (const entry of htmlQueryAll(html, "li[data-item-id]")) {
			entry.addEventListener("dblclick", ev => {
				ev.stopPropagation()
				const itemId = entry.dataset.itemId
				if (!itemId) throw ErrorGURPS("Invalid double-click operation: No item ID found")
				const item = this.item.deepContents.get(itemId)
				if (!item) throw ErrorGURPS(`Invalid double-click operation: No item found with ID: "${itemId}"`)
				item.sheet.render(true)
			})

			htmlQuery(entry, ".enabled")?.addEventListener("click", ev => {
				ev.stopPropagation()
				const itemId = entry.dataset.itemId
				if (!itemId) throw ErrorGURPS("Invalid double-click operation: No item ID found")
				const item = this.item.deepContents.get(itemId)
				if (!item) throw ErrorGURPS(`Invalid double-click operation: No item found with ID: "${itemId}"`)
				if (!item.isOfType(ItemType.TraitModifier, ItemType.EquipmentModifier))
					throw ErrorGURPS(`Item is not a modifier.`)
				item.update({ "system.disabled": !item.system.disabled })
			})

			htmlQuery(entry, ".dropdown")?.addEventListener("click", ev => {
				ev.stopPropagation()
				const itemId = entry.dataset.itemId
				if (!itemId) throw ErrorGURPS("Invalid double-click operation: No item ID found")
				const item = this.item.deepContents.get(itemId)
				if (!item) throw ErrorGURPS(`Invalid double-click operation: No item found with ID: "${itemId}"`)
				if (!item.isOfType(ItemType.TraitModifierContainer, ItemType.EquipmentModifierContainer))
					throw ErrorGURPS(`Item is not a container.`)
				item.update({ "system.open": !item.system.open })
			})
		}

		this.#activateItemDragDrop(html)
		this.#activateContextMenu(html)
		this._applyBanding()
	}

	protected _applyBanding(): void {
		const html = this.element[0]

		for (const list of htmlQueryAll(html, "[data-item-list]:not([data-container-id])")) {
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

	#activateItemDragDrop(html: HTMLElement): void {
		for (const list of htmlQueryAll(html, "ul[data-item-list]")) {
			const options: Sortable.Options = {
				...SORTABLE_BASE_OPTIONS,
				scroll: list,
				setData: (dataTransfer, dragEl) => {
					const item = this.item.deepContents.get(dragEl.dataset.itemId, { strict: true })
					dataTransfer.setData(DnD.TEXT_PLAIN, JSON.stringify(item.toDragData()))
				},
				onMove: event => this.#onMoveItem(event),
				onEnd: async event => {
					await this.#onDropItem(event)
					applyBanding(this.element[0])
				},
			}

			new Sortable(list, options)
		}
	}

	#activateContextMenu(html: HTMLElement): void {
		function getLangType(type: ItemType) {
			switch (type) {
				case ItemType.TraitModifier:
					return "trait_modifier"
				case ItemType.TraitModifierContainer:
					return "trait_modifier_container"
				case ItemType.EquipmentModifier:
					return "equipment_modifier"
				case ItemType.EquipmentModifierContainer:
					return "equipment_modifier_container"
				case ItemType.MeleeWeapon:
					return "melee_weapon"
				case ItemType.RangedWeapon:
					return "ranged_weapon"
				default:
					return null
			}
		}

		for (const itemRow of htmlQueryAll(html, "li[data-item-id]")) {
			const itemId = itemRow.dataset.itemId
			if (!itemId) throw ErrorGURPS("Invalid dropdown operation: No item ID found")
			const item = this.item.deepContents.get(itemId)
			if (!item) throw ErrorGURPS(`Invalid dropdown operation: No item found with ID: "${itemId}"`)
			ContextMenu.create(this, $(itemRow), "*", item.getContextMenuItems())
		}

		for (const itemList of htmlQueryAll(html, "ul[data-item-list]")) {
			if (itemList.children.length !== 0) continue
			const itemTypes: ItemType[] = (itemList.dataset.itemTypes?.split(",") as ItemType[]) ?? []
			const menuItems: ContextMenuEntry[] = []
			for (const type of itemTypes) {
				const langType = getLangType(type)
				if (langType === null) continue
				menuItems.push({
					name: LocalizeGURPS.translations.gurps.context.new_item[langType],
					icon: "",
					callback: async () => {
						await this.item.createEmbeddedDocuments("Item", [
							{
								name: LocalizeGURPS.translations.TYPES.Item[type],
								type,
								flags: { [SYSTEM_NAME]: { [ItemFlags.Container]: this.item._id } },
							},
						])
						this.render()
					},
				})
			}

			ContextMenu.create(this, $(itemList), "*", menuItems)
		}
	}

	#onMoveItem(event: Sortable.MoveEvent): boolean {
		const isSeparateSheet = htmlClosest(event.target, "form") !== htmlClosest(event.related, "form")
		if (!this.isEditable || isSeparateSheet) return false

		// Item being dragged
		const sourceItem = this.item.deepContents.get(event.dragged?.dataset.itemId, { strict: true })

		// Remove container highlights
		for (const row of htmlQueryAll(this.form, "li[data-is-container]")) {
			row.classList.remove("drop-highlight")
		}

		// Grab section (traits, equipment, other equipment) item is being dragged into
		const targetSection = htmlClosest(event.related, "ul[data-item-types]")?.dataset.itemTypes?.split(",") ?? []
		if (targetSection.length === 0) return false

		const targetItemRow = htmlClosest(event.related, "li[data-item-id]")
		const targetItem = this.item.deepContents.get(targetItemRow?.dataset.itemId ?? "")
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
		const isItemSection = (type: unknown): type is ItemItemSections => {
			return typeof type === "string" && itemItemSections.some(e => e === type)
		}

		if (!isItemSection(targetSection)) return

		// const sourceCollection = this.item.itemCollections.findCollection(event.item.dataset.itemId ?? "")
		const targetCollection = this.item.itemCollections[targetSection] as Collection<ItemGURPS>
		const sourceItem = this.item.deepContents.get(event.item.dataset.itemId, { strict: true })
		const itemsInList = htmlQueryAll(htmlClosest(event.item, "ul"), ":scope > li").map(li =>
			li.dataset.itemId === sourceItem.id
				? sourceItem
				: targetCollection.get(li.dataset.itemId, { strict: true }),
		)

		// There are two collections which can store items
		// This changes the flag which decides where the item is displayed
		// May have to make this more generic and improve at some point
		const otherUpdates: Record<string, unknown> = {}

		const targetItemId = htmlClosest(event.originalEvent?.target, "li[data-item-id]")?.dataset.itemId ?? ""
		const targetItem = this.item.deepContents.get(targetItemId)

		const containerElem = htmlClosest(event.item, "ul[data-container-id]")
		const containerId = containerElem?.dataset.containerId ?? ""
		const container = targetItem?.isOfType("container") ? targetItem : this.item.deepContents.get(containerId)
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
			sort?: number
			[key: string]: unknown
		}
		const sortingUpdates: SortingUpdate[] = SortingHelpers.performIntegerSort(sourceItem, {
			siblings,
			target: targetBefore ?? targetAfter,
			sortBefore: !targetBefore,
		}).map(u => ({
			_id: u.target.id,
			[`flags.${SYSTEM_NAME}.${ItemFlags.Container}`]: container?.id ?? this.item.id,
			sort: u.update.sort,
		}))
		if (!sortingUpdates.some(u => u._id === sourceItem.id)) {
			sortingUpdates.push({
				_id: sourceItem.id,
				[`flags.${SYSTEM_NAME}.${ItemFlags.Container}`]: container?.id ?? this.item.id,
				...otherUpdates,
			})
		} else {
			const index = sortingUpdates.findIndex(u => u._id === sourceItem.id)
			sortingUpdates[index] = {
				...sortingUpdates[index],
				...otherUpdates,
			}
		}

		// TODO: make sure this works
		await this.item.updateEmbeddedDocuments("Item", sortingUpdates)
	}

	override async getData(options?: Partial<ItemSheetOptions>): Promise<AbstractContainerSheetData<TItem>> {
		const sheetData = await super.getData(options)
		return {
			...sheetData,
			itemCollections: this._prepareItemCollections(),
		}
	}

	protected _prepareItemCollections(): Record<string, SheetItemCollection> {
		const collections = {
			trait_modifiers: {
				name: "traitModifiers",
				items: this._prepareItemCollection(this.item.itemCollections.traitModifiers),
				types: [ItemType.TraitModifier, ItemType.TraitModifierContainer],
			},
			equipment_modifiers: {
				name: "equipmentModifiers",
				items: this._prepareItemCollection(this.item.itemCollections.equipmentModifiers),
				types: [ItemType.EquipmentModifier, ItemType.EquipmentModifierContainer],
			},
			melee_weapons: {
				name: "meleeWeapons",
				items: this._prepareItemCollection(this.item.itemCollections.meleeWeapons),
				types: [ItemType.MeleeWeapon],
			},
			ranged_weapons: {
				name: "rangedWeapons",
				items: this._prepareItemCollection(this.item.itemCollections.rangedWeapons),
				types: [ItemType.RangedWeapon],
			},
		}
		return collections
	}

	protected _prepareItemCollection(
		collection: Collection<ItemGURPS>,
		parent: string | null = this.item._id,
	): SheetItem<ItemGURPS>[] {
		return collection.contents
			.filter(item => item.flags[SYSTEM_NAME][ItemFlags.Container] === parent)
			.sort((a, b) => (a.sort || 0) - (b.sort || 0))
			.map(e => this._prepareSheetItem(e))
	}

	protected _prepareSheetItem<TItem extends ItemGURPS = ItemGURPS>(item: TItem): SheetItem<TItem> {
		return {
			item,
			indent: item.parents.length - this.item.parents.length,
			isContainer: item.isOfType("container"),
			children: item.isOfType("container") ? this._prepareItemCollection(item.children, item._id) : [],
		}
	}

	protected override async _onDragStart(event: DragEvent): Promise<void> {
		const element = event.currentTarget
		if (!(element instanceof HTMLElement)) return

		let dragData

		// Owned Items
		if (objectHasKey(element.dataset, "itemId")) {
			const id = element.dataset.itemId ?? ""
			const item = this.item.deepContents.get(id)
			if (!item) return console.error(`No item found with id "${id}"`)

			dragData = item.toDragData()

			await createDragImage(event, item)
		}

		// Active Effects
		if (objectHasKey(element.dataset, "effectId")) {
			return console.error("Actie Effects are disabled by the system")
		}

		event.dataTransfer?.setData(DnD.TEXT_PLAIN, JSON.stringify(dragData))
	}

	protected override _onDragOver(event: DragEvent): void {
		super._onDragOver(event)
		const element = event.currentTarget
		if (!(element instanceof HTMLElement)) return
		if (!element.classList.contains("item")) return

		const heightAcross = (event.offsetY - element.offsetTop) / element.offsetHeight
		for (const item of htmlQueryAll(element.parentElement, ".item")) {
			item.classList.remove("border-top")
			item.classList.remove("border-bottom")
		}
		if (heightAcross > 0.5) {
			element.classList.remove("border-top")
			element.classList.add("border-bottom")
		} else {
			element.classList.remove("border-bottom")
			element.classList.add("border-top")
		}
	}

	protected override _onDrop(event: DragEvent): void {
		try {
			const data = DnD.getDragData(event, DnD.TEXT_PLAIN)
			if (data.type === "Item") this._onDropItem(event, data)
		} catch (err) {
			console.error(event.dataTransfer?.getData(DnD.TEXT_PLAIN))
			console.error(err)
		}
	}

	private async _onDropItem(event: DragEvent, data: DropCanvasData<"Item", ItemGURPS>): Promise<ItemGURPS[]> {
		const element = event.currentTarget
		if (!(element instanceof HTMLElement)) return []

		// Check if dropped item is being dropped above the target or inside a container
		const dropAbove = htmlQueryAll(this.element[0], ".border-top").length > 0
		const dropInContainer = htmlQueryAll(this.element[0], ".border-in").length > 0

		// Clear drop indicator styles
		for (const item of htmlQueryAll(this.element[0], ".item")) {
			item.classList.remove("border-bottom")
			item.classList.remove("border-top")
			item.classList.remove("border-in")
		}

		const item = await ItemGURPS.fromDropData(data)
		if (!item) {
			console.error("Dropped item is invalid")
			return []
		}

		if (
			item.parents
				.filter(e => e instanceof ItemGURPS)
				.map(e => (e as ActorGURPS | AbstractContainerGURPS).uuid)
				.includes(this.item.uuid)
		)
			// Drops from the same actor are handled by Sortable
			return []

		const itemData = item.toObject()

		// Handle item sorting within the same item
		if (item.parentIds.includes(this.item.id)) {
			return this._onSortItem(event, itemData, { dropAbove, dropInContainer })
		} else {
			return this._onDropItemCreate(itemData)
		}
	}

	private async _onSortItem(
		event: DragEvent,
		itemData: ItemSourceGURPS,
		options: { dropAbove: boolean; dropInContainer: boolean },
	): Promise<ItemGURPS[]> {
		// Get the drag source and drop target
		const items = this.item.deepContents
		const source = items.get(itemData._id ?? "")
		const dropTarget = htmlClosest(event.target, "[data-item-id]")
		if (!dropTarget) return []
		const target = items.get(dropTarget.dataset.itemId ?? "")
		if (!source || !target) return []

		// Don't sort on yourself
		if (source.id === target.id) return []

		// Identify sibling items based on adjacent HTML elements
		const siblings = []
		// Switch containers within the item
		if (
			options.dropInContainer &&
			target.isOfType(ItemType.TraitModifierContainer, ItemType.EquipmentModifierContainer)
		) {
			siblings.push(...target.contents)
		} else if (source.container?.id !== target.container?.id) {
			siblings.push(
				...target.collection.filter(
					item => item.flags[SYSTEM_NAME][ItemFlags.Container] === target.container?.id,
				),
			)
		}

		// Perform the sort
		const sortUpdates = SortingHelpers.performIntegerSort(source, {
			target,
			siblings,
			sortBefore: options.dropAbove,
		})
		const updateData = sortUpdates.map(u => {
			const update: EmbeddedDocumentUpdateData = { ...u.update, _id: u.target._id! }

			// Update the container to the drop target container or drop target itself if specified
			if (options.dropInContainer && update._id === target._id) {
				update[`flags.${SYSTEM_NAME}.${ItemFlags.Container}`] = target._id
			} else if (source.container?.id !== target.container?.id && update._id === target._id) {
				update[`flags.${SYSTEM_NAME}.${ItemFlags.Container}`] = target.container?._id ?? null
			}
			return update
		})

		return this.item.parent?.updateEmbeddedDocuments("Item", updateData) as Promise<ItemGURPS[]>
	}

	private async _onDropItemCreate(itemData: ItemSourceGURPS | ItemSourceGURPS[]): Promise<ItemGURPS[]> {
		itemData = itemData instanceof Array ? itemData : [itemData]

		return this.item.createContainedDocuments(itemData)
	}
}

interface AbstractContainerSheetData<TItem extends AbstractContainerGURPS> extends ItemSheetDataGURPS<TItem> {
	itemCollections: Record<string, SheetItemCollection>
}

export { AbstractContainerSheetGURPS }
export type { AbstractContainerSheetData }
