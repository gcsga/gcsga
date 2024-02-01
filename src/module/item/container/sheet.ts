import { ItemSheetDataGURPS, ItemSheetGURPS, ItemSheetOptions } from "@item/base/sheet.ts"
import { ContainerGURPS } from "./document.ts"
import { SYSTEM_NAME } from "@module/data/misc.ts"
import { ItemGURPS, ItemType, TraitModifierGURPS } from "@item"
import { DnD } from "@util/drag_drop.ts"
import { ActorGURPS } from "@actor"
import { isContainer } from "@util"

export class ContainerSheetGURPS<IType extends ContainerGURPS = ContainerGURPS> extends ItemSheetGURPS<IType> {
	static override get defaultOptions(): ItemSheetOptions {
		return fu.mergeObject(ItemSheetGURPS.defaultOptions, {
			template: `/systems/${SYSTEM_NAME}/templates/item/container-sheet.hbs`,
			dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
		})
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)
		html.find(".dropdown-toggle").on("click", event => this._onCollapseToggle(event))
		html.find(".enabled").on("click", event => this._onEnabledToggle(event))
	}

	protected override async _onDragStart(event: DragEvent): Promise<void> {
		const list = event.currentTarget

		let dragData

		// Owned Items
		if ((list as HTMLElement).dataset.itemId) {
			const item = (this.item as ContainerGURPS).deepItems.get((list as HTMLElement).dataset.itemId!)
			dragData = item?.toDragData()

			// Create custom drag image
			const dragImage = document.createElement("div")
			dragImage.innerHTML = await renderTemplate(`systems/${SYSTEM_NAME}/templates/actor/drag-image.hbs`, {
				name: `${item?.name}`,
				type: `${item?.type.replace("_container", "").replaceAll("_", "-")}`,
			})
			dragImage.id = "drag-ghost"
			document.body.querySelectorAll("#drag-ghost").forEach(e => e.remove())
			document.body.appendChild(dragImage)
			const height = (document.body.querySelector("#drag-ghost") as HTMLElement).offsetHeight
			event.dataTransfer?.setDragImage(dragImage, 0, height / 2)
		}

		// Active Effect
		if ((list as HTMLElement).dataset.effectId) {
			const effect = (this.item as ContainerGURPS).effects.get((list as HTMLElement).dataset.effectId!)
			// @ts-expect-error idk
			dragData = effect?.toDragData()
		}

		// Set data transfer
		event.dataTransfer?.setData("text/plain", JSON.stringify(dragData))
	}

	override async getData(options: Partial<ItemSheetOptions> = {}): Promise<ItemSheetDataGURPS<IType>> {
		const data = super.getData(options)
		const items = this.object.items
		return fu.mergeObject(data, {
			settings: { notes_display: "inline" },
			items: items,
			meleeWeapons: items.filter(e => [ItemType.MeleeWeapon].includes(e.type)),
			rangedWeapons: items.filter(e => [ItemType.RangedWeapon].includes(e.type)),
		})
	}

	protected override _onDrop(event: DragEvent): void {
		event.preventDefault()
		event.stopPropagation()
		let data
		try {
			data = DnD.getDragData(event, DnD.TEXT_PLAIN)
		} catch (err) {
			console.error(event.dataTransfer?.getData("text/plain"))
			console.error(err)
			return
		}

		switch (data.type) {
			case "Item":
				this._onDropItem(event, data as DropCanvasData<"Item", IType>)
		}
	}

	// DragData handling
	protected async _onDropItem(event: DragEvent, data: DropCanvasData<"Item", Item>): Promise<Item[]> {
		const top = Boolean($(".border-top").length)
		const inContainer = Boolean($(".border-in").length)

		$(".border-bottom").removeClass("border-bottom")
		$(".border-top").removeClass("border-top")
		$(".border-in").removeClass("border-in")

		if (!this.item.isOwner) return []

		const item = await Item.implementation.fromDropData(data)
		const itemData = item?.toObject() as ItemGURPS["_source"]

		// Handle item sorting within the same Actor
		if (this.item.uuid === item?.parent?.uuid) {
			return this._onSortItem(event, itemData, { top: top, in: inContainer })
		} else {
			return this._onDropItemCreate(itemData)
		}
	}

	async _onDropItemCreate(itemData: ItemGURPS["_source"] | ItemGURPS["_source"][]): Promise<Item[]> {
		itemData = itemData instanceof Array ? itemData : [itemData]
		return (this.item as ContainerGURPS).createEmbeddedDocuments("Item", itemData, {
			temporary: false,
		}) as unknown as Item[]
	}

	protected async _onSortItem(
		event: DragEvent,
		itemData: ItemGURPS["_source"],
		options: { top: boolean; in: boolean } = { top: false, in: false },
	): Promise<Item[]> {
		const source = this.object.deepItems.get(itemData._id!) as ItemGURPS
		const dropTarget = $(event.target!).closest(".desc[data-item-id]")
		let target = this.object.deepItems.get(dropTarget?.data("item-id")) as ItemGURPS
		if (!target) return []
		let parent = target?.parent as ContainerGURPS | ActorGURPS
		const parents = target?.parents
		if (options.in) {
			parent = target as ContainerGURPS
			target = parent.children.contents[0] ?? null
		}
		const siblings = (parent!.items as Collection<ItemGURPS>).filter(
			i => i.id !== source!.id && source.sameSection(i),
		)
		if (target && !source.sameSection(target)) return []

		const sortUpdates = SortingHelpers.performIntegerSort(source, {
			target: target,
			siblings: siblings,
			sortBefore: options.top,
		})
		const updateData = sortUpdates.map(u => {
			const update = u.update as Record<string, unknown>
			update._id = u.target._id
			return update
		}) as EmbeddedDocumentUpdateData[]

		if (source && source.parent !== parent) {
			if (source instanceof ContainerGURPS && parents.includes(source)) return []
			await source.parent!.deleteEmbeddedDocuments("Item", [source!._id!], { render: false })
			return parent?.createEmbeddedDocuments(
				"Item",
				[
					{
						name: source.name!,
						data: source.system,
						type: source.type,
						flags: source.flags,
						sort: updateData[0].sort,
					},
				],
				{ temporary: false },
			) as unknown as ItemGURPS[]
		}
		return parent!.updateEmbeddedDocuments("Item", updateData) as unknown as Item[]
	}

	protected async _onCollapseToggle(event: JQuery.ClickEvent): Promise<void> {
		event.preventDefault()
		const id = $(event.currentTarget).data("item-id")
		const item = this.item.deepItems.get(id)
		const open = !!$(event.currentTarget).attr("class")?.includes("closed")
		item?.update({ "system.open": open })
	}

	protected async _onEnabledToggle(event: JQuery.ClickEvent): Promise<this> {
		event.preventDefault()
		const id = $(event.currentTarget).data("item-id")
		const item = this.item.deepItems.get(id)
		if (isContainer(item as ItemGURPS)) return this
		await item?.update({
			"system.disabled": (item as TraitModifierGURPS).enabled,
		})
		return this.render()
	}
}
