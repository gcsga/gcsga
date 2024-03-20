import { ItemGURPS } from "@item"
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

		this.#activateItemDragDrop(html)
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

	#onMoveItem(event: Sortable.MoveEvent): boolean {
		const isSeparateSheet = htmlClosest(event.target, "form") !== htmlClosest(event.related, "form")
		if (!this.isEditable || isSeparateSheet) return false

		const sourceItem = this.actor.items.get(event.dragged?.dataset.itemId, { strict: true })

		for (const row of htmlQueryAll(this.form, "li[data-is-container] > .data")) {
			row.classList.remove("drop-highlight")
		}

		const targetSection = htmlClosest(event.related, "ul[data-item-types]")?.dataset.itemTypes?.split(",") ?? []
		if (targetSection.length === 0) return false
		if (targetSection.includes(sourceItem.type)) return true

		const openContainerId = htmlClosest(event.related, "ul[data-container-id]")?.dataset.containerId ?? ""
		const openContainer = this.actor.items.get(openContainerId)
		const targetItemRow = htmlClosest(event.related, "li[data-item-id]")
		const targetItem = this.actor.items.get(targetItemRow?.dataset.itemId ?? "")
		if (targetItem?.isOfType("container")) {
			if (isContainerCycle(sourceItem, targetItem)) return false
			if (targetItemRow && !openContainer) {
				targetItemRow.classList.add("drop-highlight")
				return false
			}
		}
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

		// Drops from the same actor are handled by Sortable
		if (item.actor?.uuid === this.actor.uuid) return []

		if (item.actor && item.isOfType(ItemType.Equipment, ItemType.EquipmentContainer)) {
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
		// data: DropCanvasItemDataGURPS,
	): Promise<ItemGURPS<ActorGURPS | null>[]> {
		// const actor = this.actor
		const itemSource = item.toObject()

		// Get the item type of the drop target
		// const containerAttribute = htmlClosest(event.target, ".item-container")?.dataset.containerType
		// const unspecificInventory = this._tabs[0]?.active === "inventory" && !containerAttribute
		// const dropContainerType = unspecificInventory ? "actorInventory" : containerAttribute
		// const craftingTab = this._tabs[0]?.active === "crafting"

		// Otherwise they are dragging a new spell onto their sheet.
		// we still need to put it in the correct spellcastingEntry
		// if (item.isOfType("spell") && itemSource.type === "spell") {
		// 	if (item.isRitual) {
		// 		return this._onDropItemCreate(item.clone().toObject())
		// 	} else if (dropContainerType === "actorInventory" && itemSource.system.level.value > 0) {
		// 		const popup = new CastingItemCreateDialog(
		// 			actor,
		// 			{},
		// 			async (heightenedLevel, itemType, spell) => {
		// 				const createdItem = await createConsumableFromSpell(spell, {
		// 					type: itemType,
		// 					heightenedLevel,
		// 					mystified,
		// 				})
		// 				await this._onDropItemCreate(createdItem)
		// 			},
		// 			item,
		// 		)
		// 		popup.render(true)
		// 		return [item]
		// 	} else {
		// 		return []
		// 	}
		// } else if (itemSource.type === "spellcastingEntry") {
		// 	// spellcastingEntry can only be created. drag & drop between actors not allowed
		// 	return []
		// } else if (itemSource.type === "condition") {
		// 	const value = data.value
		// 	if (typeof value === "number" && itemSource.system.value.isValued) {
		// 		itemSource.system.value.value = value
		// 	}
		//
		// 	if (!actor.canUserModify(game.user, "update")) {
		// 		ui.notifications.error("PF2E.ErrorMessage.NoUpdatePermission", { localize: true })
		// 		return []
		// 	} else {
		// 		const updated = await actor.increaseCondition(itemSource.system.slug, { value })
		// 		return [updated ?? []].flat()
		// 	}
		// } else if (itemIsOfType(itemSource, "affliction", "effect")) {
		// 	// Pass along level, badge-value, and traits to an effect dragged from a spell
		// 	const { level, value, context } = data
		// 	if (typeof level === "number" && level >= 0) {
		// 		itemSource.system.level.value = Math.floor(level)
		// 	}
		// 	if (
		// 		itemSource.type === "effect" &&
		// 		itemSource.system.badge?.type === "counter" &&
		// 		typeof value === "number"
		// 	) {
		// 		itemSource.system.badge.value = value
		// 	}
		// 	itemSource.system.context = context ?? null
		// 	const originItem = fromUuidSync(context?.origin.item ?? "")
		// 	if (itemSource.system.traits?.value.length === 0 && originItem instanceof SpellPF2e) {
		// 		const spellTraits: string[] = originItem.system.traits.value
		// 		const effectTraits = spellTraits.filter((t): t is EffectTrait => t in CONFIG.PF2E.effectTraits)
		// 		itemSource.system.traits.value.push(...effectTraits)
		// 	}
		// } else if (item.isOfType("physical") && actor.isOfType("character") && craftingTab) {
		// 	const actorFormulas = fu.deepClone(actor.system.crafting.formulas)
		// 	if (!actorFormulas.some(f => f.uuid === item.uuid)) {
		// 		actorFormulas.push({ uuid: item.uuid })
		// 		await actor.update({ "system.crafting.formulas": actorFormulas })
		// 	}
		// 	return [item]
		// }

		// if (itemIsOfType(itemSource, "physical")) {
		const containerId = htmlClosest(event.target, "li[data-is-container]")?.dataset.itemId?.trim() || null
		const container = this.actor.items.find(container => container.id === containerId)
		if (container) {
			itemSource.flags[SYSTEM_NAME]![ItemFlags.Container] = containerId
			// itemSource.system.equipped.carryType = "stowed"
		} else {
			// itemSource.system.equipped.carryType = "worn"
		}
		// If the item is from a compendium, adjust the size to be appropriate to the creature's
		// if (data?.uuid?.startsWith("Compendium") && itemSource.type !== "treasure" && actor.isOfType("creature")) {
		// 	const sourceSize = actor.system.traits?.naturalSize ?? actor.size
		// 	itemSource.system.size = sourceSize === "sm" ? "med" : sourceSize
		// }
		// }

		// Creating a new item: clear the _id via cloning it
		return this._onDropItemCreate(new Item.implementation(itemSource).clone().toObject()) as Promise<
			ItemGURPS<TActor>[]
		>
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
		// const stackable = !!targetActor.itemCollections.findStackableItem(item._source);
		// const isPurchase = sourceActor.isOfType(ActorType.Loot) && sourceActor.isMerchant && !sourceActor.isOwner;
		// const isAmmunition = item.isOfType("consumable") && item.isAmmo;

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
