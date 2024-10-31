import { ItemTemplateType } from "@module/data/item/types.ts"
import { MaybePromise } from "@module/data/types.ts"
import { ActorGURPS2 } from "@module/documents/actor.ts"
import { ItemGURPS2 } from "@module/documents/item.ts"
import { ErrorGURPS, htmlClosest } from "@util"
import sheets = foundry.applications.sheets
import { ContextMenuGURPS } from "../context-menu.ts"
import { SYSTEM_NAME, HOOKS, ItemType } from "@module/data/constants.ts"

class InventoryElement extends HTMLElement {
	connectedCallback(): void {
		const app = foundry.applications.instances.get(htmlClosest(this, ".application")?.id ?? "")
		if (app instanceof sheets.ActorSheetV2 || app instanceof sheets.ItemSheetV2) this.#app = app
		else {
			throw ErrorGURPS("Application holding Inventory element is not an Actor Sheet or Item Sheet")
		}

		for (const control of this.querySelectorAll("[data-context-menu]")) {
			control.addEventListener("click", event => {
				event.preventDefault()
				event.stopPropagation()
				const { clientX, clientY } = event as MouseEvent
				htmlClosest(event.currentTarget, "[data-item-id")?.dispatchEvent(
					new PointerEvent("contextmenu", {
						view: window,
						bubbles: true,
						cancelable: true,
						clientX,
						clientY,
					}),
				)
			})
		}

		new ContextMenuGURPS(this, "[data-item-id]", [], {
			onOpen: this._onOpenItemContextMenu.bind(this),
		})
	}

	/* -------------------------------------------- */
	/*  Properties                                  */
	/* -------------------------------------------- */

	/**
	 * Reference to the application that contains this component.
	 */
	// @ts-expect-error is assigned
	#app: sheets.ActorSheetV2<ActorGURPS2> | sheets.ItemSheetV2<ItemGURPS2>

	/* -------------------------------------------- */

	/**
	 * Reference to the application that contains this component.
	 */
	protected get _app(): sheets.ActorSheetV2<ActorGURPS2> | sheets.ItemSheetV2<ItemGURPS2> {
		return this.#app
	}

	/* -------------------------------------------- */

	/**
	 * Containing actor for this inventory, either the document or its parent if document is an item.
	 */
	get actor(): ActorGURPS2 | null {
		if (this.document instanceof Actor) return this.document
		return this.document.actor ?? null
	}

	/* -------------------------------------------- */

	/**
	 * Document whose inventory is represented.
	 */
	get document(): ActorGURPS2 | ItemGURPS2 {
		return this._app.document
	}

	/* -------------------------------------------- */
	/*  Helpers                                     */
	/* -------------------------------------------- */

	/**
	 * Retrieve an item with the specified ID.
	 */
	getItem(id: string): MaybePromise<ItemGURPS2 | null> {
		if (this.document instanceof ItemGURPS2) {
			if (this.document.hasTemplate(ItemTemplateType.Container)) return this.document.system.getContainedItem(id)
			throw ErrorGURPS("Element with inventory is not a Container.")
		}
		return this.document.items.get(id) ?? null
	}

	/* -------------------------------------------- */

	/* -------------------------------------------- */
	/*  Event Handlers                              */
	/* -------------------------------------------- */

	protected _onOpenItemContextMenu(element: HTMLElement): void {
		const item = this.getItem((element.closest("[data-item-id]") as HTMLElement)?.dataset.itemId ?? "")
		// Parts of ContextMenu doesn't play well with promises, so don't show menus for containers in packs
		if (!item || item instanceof Promise) return

		if (ui.context) {
			ui.context.menuItems = this._getItemContextOptions(item, element)
			Hooks.call(`${SYSTEM_NAME}.${HOOKS.GET_ITEM_CONTEXT_OPTIONS}`, item, ui.context.menuItems)
		}
	}

	/* -------------------------------------------- */

	protected async _onItemAction(target: HTMLElement, action: string) {
		const { itemId } = (target.closest("[data-item-id]") as HTMLElement)?.dataset ?? {}
		const item = await this.getItem(itemId ?? "")
		if (!item) return

		switch (action) {
			case "delete":
				return item.deleteDialog()
			case "duplicate":
				return item.clone({ name: game.i18n.format("DOCUMENT.CopyOf", { name: item.name }) }, { save: true })
			case "edit":
			case "view":
				return item.sheet.render(true)
			case "toggle": {
				if (!item.isOfType(ItemType.TraitModifier, ItemType.EquipmentModifier)) return
				return item.update({ "system.disabled": !item.system.disabled })
			}
			default:
				console.error(`Invalid action "${action}"`)
				return
		}
	}

	/* -------------------------------------------- */

	protected _getItemContextOptions(item: ItemGURPS2, _element: HTMLElement): ContextMenuEntry[] {
		const options = [
			{
				name: "Edit",
				icon: "<i class='fa-solid fa-edit'></i>",
				callback: (li: JQuery<HTMLElement>) => this._onItemAction(li[0], "edit"),
				condition: () => item.isOwner && !item.compendium?.locked,
			},
			{
				name: "View",
				icon: "<i class='fa-solid fa-eye'></i>",
				callback: (li: JQuery<HTMLElement>) => this._onItemAction(li[0], "view"),
				condition: () => !item.isOwner || (!!item.compendium && item.compendium.locked),
			},
			{
				name: "Duplicate",
				icon: "<i class='fa-solid fa-copy'></i>",
				callback: (li: JQuery<HTMLElement>) => this._onItemAction(li[0], "duplicate"),
				condition: () => item.isOwner && !item.compendium?.locked,
			},
			{
				name: "Delete",
				icon: "<i class='fa-solid fa-trash'></i>",
				callback: (li: JQuery<HTMLElement>) => this._onItemAction(li[0], "delete"),
				condition: () => item.isOwner && !item.compendium?.locked,
			},
			{
				name: "Toggle",
				icon: `<i class='fa-solid fa-${
					item.isOfType(ItemType.EquipmentModifier, ItemType.TraitModifier)
						? item.system.disabled
							? "toggle-off"
							: "toggle-on"
						: "fa-ban" // Placeholder
				}'></i>`,
				callback: (li: JQuery<HTMLElement>) => this._onItemAction(li[0], "toggle"),
				condition: () =>
					item.isOwner &&
					!item.compendium?.locked &&
					item.isOfType(ItemType.EquipmentModifier, ItemType.TraitModifier),
			},
		]

		return options
	}
}

export { InventoryElement }
