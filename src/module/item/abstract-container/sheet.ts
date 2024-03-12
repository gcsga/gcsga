import { ItemSheetDataGURPS, ItemSheetGURPS, ItemSheetOptions } from "@item/base/sheet.ts"
import { AbstractContainerGURPS } from "./document.ts"
import { DnD, htmlClosest, htmlQueryAll, objectHasKey } from "@util"
import { ItemFlags, ItemType, SYSTEM_NAME } from "@module/data/constants.ts"
import { createDragImage } from "@util/drag-image.ts"
import { ItemGURPS } from "@item"
import { ItemSourceGURPS } from "@item/data/index.ts"

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
	}

	override async getData(options?: Partial<ItemSheetOptions>): Promise<AbstractContainerSheetData<TItem>> {
		const sheetData = await super.getData(options)

		const item = this.item

		return {
			...sheetData,
			item,
			system: item.system,
			itemCollections: {
				melee_weapons: item.itemCollections.meleeWeapons,
				ranged_weapons: item.itemCollections.rangedWeapons,
				trait_modifiers: item.itemCollections.traitModifiers,
				equipment_modifiers: item.itemCollections.equipmentModifiers,
			},
			config: CONFIG.GURPS,
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
				...target.parent.items.filter(
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
	item: TItem
	system: TItem["system"]
	itemCollections: Record<string, Collection<ItemGURPS>>
	config: ConfigGURPS["GURPS"]
}

export { AbstractContainerSheetGURPS }
export type { AbstractContainerSheetData }
