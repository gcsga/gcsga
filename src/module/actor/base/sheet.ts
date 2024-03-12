import { ItemGURPS } from "@item"
import { ActorGURPS } from "./document.ts"
import { DamagePayload, DropDataType } from "@module/apps/damage-calculator/damage-chat-message.ts"
import { DnD, htmlClosest, htmlQuery, htmlQueryAll } from "@util"
import { ItemSourceGURPS } from "@item/data/index.ts"
import { ItemFlags, ItemType, SYSTEM_NAME } from "@module/data/constants.ts"
import { ItemSections } from "./item-collection-map.ts"

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

		for (const item of htmlQueryAll(html, ".item")) {
			item.addEventListener("dragover", ev => this._onDragOverItem(ev))
		}
	}

	protected _onDragOverItem(event: DragEvent): void {
		const element = event.target
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

		// this._highlightDropArea(event)
	}

	// Created a highlighted area corresponding to the table the item will be sorted into
	private _highlightDropArea(event: DragEvent): void {
		const itemData = JSON.parse(htmlQuery(document, "#drag-ghost")?.dataset.item ?? "") as ItemSourceGURPS
		if (!itemData) {
			console.error("dragged item data cannot be found")
			return
		}
		const dropSection = this.actor.itemCollections.getSectionName(itemData)

		if (dropSection === null) {
			console.error(`Item of type "${itemData.type}" does not fit any section on this sheet`)
			return
		}

		for (const element of htmlQueryAll(this.element[0], ".item-list")) {
			if (element.id !== dropSection) {
				element.classList.remove("dragsection")
				element.classList.remove("dragindirect")
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
		const element = event.currentTarget
		if (!(element instanceof HTMLElement)) return []

		// Check if dropped item is being dropped above the target or inside a container
		const dropAbove = htmlQueryAll(this.element[0], ".border-top").length > 0
		const dropInContainer = htmlQueryAll(this.element[0], ".border-in").length > 0
		let dropSection = (htmlClosest(event.currentTarget, ".item-list")?.id as ItemSections) ?? null

		// Clear drop indicator styles
		for (const item of htmlQueryAll(this.element[0], ".item")) {
			item.classList.remove("border-bottom")
			item.classList.remove("border-top")
			item.classList.remove("border-in")
		}

		if (dropSection === null) {
			const itemData = await ItemGURPS.fromDropData(data)
			if (itemData) dropSection = this.actor.itemCollections.getSectionName(itemData.toObject())
		}

		if (dropSection === null) {
			console.error(`Item of type "${data.itemType}" does not fit any section on this sheet`)
			return []
		}

		const item = await ItemGURPS.fromDropData(data)
		if (!item) {
			console.error("Dropped item is invalid")
			return []
		}
		const itemData = item.toObject()

		// Handle item sorting within the same item
		try {
			if (item.parentIds.includes(this.actor.id)) {
				return this._onSortItem(event, itemData, { dropAbove, dropInContainer, dropSection })
			} else {
				return this._onDropItemCreate(itemData)
			}
		} finally {
			for (const element of htmlQueryAll(this.element[0], ".dragsection")) {
				element.classList.remove("dragsection")
			}
			for (const element of htmlQueryAll(this.element[0], ".dragindirect")) {
				element.classList.remove("dragindirect")
			}
		}
	}

	protected override async _onSortItem(
		event: DragEvent,
		itemData: ItemSourceGURPS,
		options: { dropAbove: boolean; dropInContainer: boolean; dropSection: ItemSections } = {
			dropAbove: false,
			dropInContainer: false,
			dropSection: null,
		},
	): Promise<ItemGURPS[]> {
		// Get the drag source and drop target
		const items = this.actor.items
		const source = items.get(itemData._id ?? "")
		const dropTarget = htmlClosest(event.target, "[data-item-id]")
		if (!dropTarget) return []
		const target = items.get(dropTarget.dataset.itemId ?? "")
		console.log(source, dropTarget, target)

		if (!source || !target) return []

		// Don't sort on yourself
		if (source.id === target.id) return []

		// Identify sibling items based on adjacent HTML elements
		const siblings = []
		// Switch containers within the item
		if (
			options.dropInContainer &&
			target.isOfType(
				ItemType.TraitContainer,
				ItemType.SkillContainer,
				ItemType.SpellContainer,
				ItemType.EquipmentContainer,
				ItemType.NoteContainer,
			)
		) {
			siblings.push(...target.contents)
		} else if (source.container?.id !== target.container?.id) {
			siblings.push(
				...items.filter(item => item.flags[SYSTEM_NAME]?.[ItemFlags.Container] === target.container?.id),
			)
		} else {
			const collection = this.actor.itemCollections.getSection(source.toObject())
			if (collection) siblings.push(...collection)
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

		return this.actor.updateEmbeddedDocuments("Item", updateData) as Promise<ItemGURPS[]>
	}

	protected override async _onDropItemCreate(
		itemData: ItemSourceGURPS | ItemSourceGURPS[],
	): Promise<ItemGURPS<TActor>[]> {
		return super._onDropItemCreate(itemData) as Promise<ItemGURPS<TActor>[]>
	}
}

interface ActorSheetGURPS<TActor extends ActorGURPS> extends ActorSheet<TActor, ItemGURPS> {}

interface ActorSheetDataGURPS<TActor extends ActorGURPS> extends ActorSheetData<TActor> {}

export { ActorSheetGURPS }
export type { ActorSheetDataGURPS }
