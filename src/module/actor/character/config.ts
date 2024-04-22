import { DropDataType } from "@module/apps/damage-calculator/damage-chat-message.ts"
import { FilePickerGURPS } from "@module/apps/file-picker.ts"
import { SETTINGS, SORTABLE_BASE_OPTIONS, SYSTEM_NAME } from "@module/data/constants.ts"
import { AbstractAttributeDef, AttributeDefObj, MoveTypeDefObj, ResourceTrackerDefObj } from "@system"
import { DnD, LocalizeGURPS, htmlClosest, htmlQuery, htmlQueryAll, prepareFormData } from "@util"
import { CharacterGURPS } from "./document.ts"
import Sortable from "sortablejs"
import { CharacterFlags } from "./data.ts"
import { CharacterImporter, PDF, SettingsHelpers } from "@module/util/index.ts"
import { DropDataContext } from "@module/util/settings-helpers.ts"

class CharacterConfigSheet<TActor extends CharacterGURPS = CharacterGURPS> extends DocumentSheet<TActor> {
	// Display this filename in the import button text before importing
	declare filename: string
	declare file?: { text: string; name: string; path: string }
	private declare reservedIds: string[]

	get actor(): TActor {
		return this.object
	}

	get attributes(): AttributeDefObj[] {
		return this.actor.system.settings.attributes
	}

	get resourceTrackers(): ResourceTrackerDefObj[] {
		return this.actor.system.settings.resource_trackers
	}

	get moveTypes(): MoveTypeDefObj[] {
		return this.actor.system.settings.move_types
	}

	static override get defaultOptions(): DocumentSheetOptions {
		return fu.mergeObject(super.defaultOptions, {
			classes: ["character-config", "gurps"],
			template: `systems/${SYSTEM_NAME}/templates/actor/character/config/config.hbs`,
			width: 540,
			submitOnChange: true,
			submitOnClose: true,
			closeOnSubmit: false,
			tabs: [
				{
					navSelector: "nav",
					contentSelector: "section.content",
					initital: "sheet-settings",
				},
			],
			dragDrop: [{ dragSelector: ".item-list .item .controls .drag", dropSelector: null }],
			scrollY: [".content", ".item-list", ".tab"],
		})
	}

	override get title(): string {
		return LocalizeGURPS.format(LocalizeGURPS.translations.gurps.character.settings.header, {
			name: this.object.name,
		})
	}

	protected override _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
		const element = event.currentTarget
		if (!(element instanceof HTMLElement)) return super._updateObject(event, {})

		if (element instanceof HTMLInputElement)
			if (element.classList.contains("invalid")) delete formData[element.name]

		if (formData["system.settings.block_layout"]) {
			console.log(formData["system.settings.block_layout"])
			formData["system.settings.block_layout"] = (formData["system.settings.block_layout"] as string)
				.split("\r")
				.map(e => e.trim())
		}

		formData = prepareFormData(formData, this.actor)
		return super._updateObject(event, formData)
	}

	override async getData(options?: ActorSheetOptions): Promise<CharacterConfigSheetData<TActor>> {
		const sheetData = await super.getData(options)

		const actor = this.actor

		const attributes = actor.settings.attributes.sort((a, b) => a.order - b.order)
		const resourceTrackers = actor.settings.resource_trackers.sort((a, b) => a.order - b.order)
		const moveTypes = actor.settings.move_types.sort((a, b) => a.order - b.order)

		return {
			...sheetData,
			actor,
			system: this.actor.system,
			settings: this.actor.flags[SYSTEM_NAME],
			attributes: {
				attributes,
				resourceTrackers,
				moveTypes,
			},
			filename: this.filename,
			config: CONFIG.GURPS,
			flags: this.actor.flags[SYSTEM_NAME],
		}
	}

	override activateListeners($html: JQuery): void {
		super.activateListeners($html)
		const html = $html[0]

		this.#activateItemDragDrop(html)

		// Open PDF links
		for (const ref of htmlQueryAll(html, "a.ref")) ref.addEventListener("click", ev => PDF.handle(ev))

		// Reset section to defaults
		htmlQuery(html, "a[data-action=reset-all]")?.addEventListener("click", ev => this._onResetAll(ev))

		// Validate IDs for attributes and hit locations
		for (const input of htmlQueryAll(html, "input[name$='.id']")) {
			input.addEventListener("input", ev => {
				const element = ev.currentTarget
				if (!(element instanceof HTMLInputElement && ev instanceof InputEvent)) return null

				return SettingsHelpers.validateId({
					element,
					app: this,
					targetIndex: 0,
				})
			})
		}

		// Handle client-side and server-side import
		if (game.settings.get(SYSTEM_NAME, SETTINGS.SERVER_SIDE_FILE_DIALOG))
			htmlQuery(html, "input[type='file']")?.addEventListener("click", ev => this._openServerSideImport(ev))
		else htmlQuery(html, "input[type='file']")?.addEventListener("change", ev => this._openClientSideImport(ev))

		// Confirm Import
		htmlQuery(html, "button[data-action=import-confirm]")?.addEventListener("click", () => this._onImportConfirm())

		// Reimport
		htmlQuery(html, "button[data-action=reimport]")?.addEventListener("click", () => this._onReImport())

		for (const button of htmlQueryAll(html, "a[data-action^=add-]")) {
			const context: DropDataContext = {
				element: button,
				app: this,
				targetIndex: 0,
			}

			switch (button.dataset.action) {
				case "add-attribute":
					button.addEventListener("click", () => SettingsHelpers.addAttribute(context))
					break
				case "add-attribute-threshold":
					button.addEventListener("click", () => SettingsHelpers.addAttributeThreshold(context))
					break
				case "add-resource-tracker":
					button.addEventListener("click", () => SettingsHelpers.addResourceTracker(context))
					break
				case "add-resource-tracker-threshold":
					button.addEventListener("click", () => SettingsHelpers.addResourceTrackerThreshold(context))
					break
				case "add-move-type":
					button.addEventListener("click", () => SettingsHelpers.addMoveType(context))
					break
				case "add-move-type-override":
					button.addEventListener("click", () => SettingsHelpers.addMoveTypeOverride(context))
					break
				case "add-location":
					button.addEventListener("click", () => SettingsHelpers.addHitLocation(context))
					break
				case "add-sub-table":
					button.addEventListener("click", () => SettingsHelpers.addSubTable(context))
					break
			}
		}

		for (const button of htmlQueryAll(html, "a[data-action^=remove-]")) {
			const context: DropDataContext = {
				element: button,
				app: this,
				targetIndex: 0,
			}

			switch (button.dataset.action) {
				case "remove-attribute":
					button.addEventListener("click", () => SettingsHelpers.removeAttribute(context))
					break
				case "remove-attribute-threshold":
					button.addEventListener("click", () => SettingsHelpers.removeAttributeThreshold(context))
					break
				case "remove-resource-tracker":
					button.addEventListener("click", () => SettingsHelpers.removeResourceTracker(context))
					break
				case "remove-resource-tracker-threshold":
					button.addEventListener("click", () => SettingsHelpers.removeResourceTrackerThreshold(context))
					break
				case "remove-move-type":
					button.addEventListener("click", () => SettingsHelpers.removeMoveType(context))
					break
				case "remove-move-type-override":
					button.addEventListener("click", () => SettingsHelpers.removeMoveTypeOverride(context))
					break
				case "remove-location":
					button.addEventListener("click", () => SettingsHelpers.removeHitLocation(context))
					break
				case "remove-sub-table":
					button.addEventListener("click", () => SettingsHelpers.removeSubTable(context))
					break
			}
		}
	}

	#activateItemDragDrop(html: HTMLElement): void {
		for (const list of htmlQueryAll(html, "ul[data-item-list]")) {
			const options: Sortable.Options = {
				...SORTABLE_BASE_OPTIONS,
				scroll: list,
				setData: (dataTransfer, dragEl) => {
					const type = dragEl.dataset.type as DropDataType
					const index = parseInt(dragEl.dataset.index ?? "")
					if (isNaN(index)) return console.error("Invalid index")

					const parentIndex = parseInt(dragEl.dataset.pindex ?? "")
					dataTransfer.setData(
						DnD.TEXT_PLAIN,
						JSON.stringify({ type, index, parentIndex: isNaN(parentIndex) ? 0 : parentIndex }),
					)
				},
				onMove: event => this.#onMoveItem(event),
				onEnd: event => this.#onDropItem(event),
			}

			new Sortable(list, options)
		}
	}

	#onMoveItem(event: Sortable.MoveEvent): boolean {
		const isSeparateSheet = htmlClosest(event.target, "form") !== htmlClosest(event.related, "form")
		if (!this.isEditable || isSeparateSheet) return false

		const type = event.dragged?.dataset.type ?? ""

		const targetRow = htmlClosest(event.related, "li.item[data-type]")
		if (targetRow?.dataset.type === type) return true
		return false
	}

	async #onDropItem(event: Sortable.SortableEvent & { originalEvent?: DragEvent }): Promise<void> {
		const isSeparateSheet = htmlClosest(event.target, "form") !== htmlClosest(event.originalEvent?.target, "form")
		if (!this.isEditable || isSeparateSheet) return

		const dragData = DnD.getSortableDragData(event, DnD.TEXT_PLAIN)

		const element = event.originalEvent?.target
		if (!(element instanceof HTMLElement)) return console.error("Drop event target is not valid.")

		const targetIndex = parseInt(element.dataset.index ?? "")
		if (isNaN(targetIndex)) return console.error("Drop target index is not valid", element)

		const context: DropDataContext = {
			element,
			app: this,
			targetIndex,
		}

		switch (dragData.type) {
			case DropDataType.Attribute:
				return SettingsHelpers.onDropAttribute(dragData, context)
			case DropDataType.AttributeThreshold:
				return SettingsHelpers.onDropAttributeThreshold(dragData, context)
			case DropDataType.ResourceTracker:
				return SettingsHelpers.onDropResourceTracker(dragData, context)
			case DropDataType.ResourceTrackerThreshold:
				return SettingsHelpers.onDropResourceTrackerThreshold(dragData, context)
			case DropDataType.MoveType:
				return SettingsHelpers.onDropMoveType(dragData, context)
			case DropDataType.MoveTypeOverride:
				return SettingsHelpers.onDropMoveTypeOverride(dragData, context)
			case DropDataType.HitLocation:
				return SettingsHelpers.onDropHitLocation(dragData, context)
		}
		// const targetSection =
		// 	htmlClosest(event.originalEvent?.target, "ul[data-item-section]")?.dataset.itemSection ?? ""
		// const isItemSection = (type: unknown): type is ItemSections => {
		// 	return typeof type === "string" && itemSections.some(e => e === type)
		// }
		// if (!isItemSection(targetSection)) return
		//
		// const collection = this.actor.itemCollections[targetSection] as Collection<ItemGURPS<TActor>>
		// const sourceItem = collection.get(event.item.dataset.itemId, { strict: true })
		// const itemsInList = htmlQueryAll(htmlClosest(event.item, "ul"), ":scope > li").map(li =>
		// 	li.dataset.itemId === sourceItem.id ? sourceItem : collection.get(li.dataset.itemId, { strict: true }),
		// )
		//
		// const targetItemId = htmlClosest(event.originalEvent?.target, "li[data-item-id]")?.dataset.itemId ?? ""
		// const targetItem = this.actor.items.get(targetItemId)
		//
		// const containerElem = htmlClosest(event.item, "ul[data-container-id]")
		// const containerId = containerElem?.dataset.containerId ?? ""
		// const container = targetItem?.isOfType("container") ? targetItem : collection.get(containerId)
		// if (container && !container.isOfType("container")) {
		// 	throw ErrorGURPS("Unexpected non-container retrieved while sorting items")
		// }
		//
		// if (container && isContainerCycle(sourceItem, container)) {
		// 	this.render()
		// 	return
		// }
		//
		// const sourceIndex = itemsInList.indexOf(sourceItem)
		// const targetBefore = itemsInList[sourceIndex - 1]
		// const targetAfter = itemsInList[sourceIndex + 1]
		// const siblings = [...itemsInList]
		// siblings.splice(siblings.indexOf(sourceItem), 1)
		// type SortingUpdate = {
		// 	_id: string
		// 	"flags.gcsga.container": string | null
		// 	sort?: number
		// }
		// const sortingUpdates: SortingUpdate[] = SortingHelpers.performIntegerSort(sourceItem, {
		// 	siblings,
		// 	target: targetBefore ?? targetAfter,
		// 	sortBefore: !targetBefore,
		// }).map(u => ({ _id: u.target.id, "flags.gcsga.container": container?.id ?? null, sort: u.update.sort }))
		// if (!sortingUpdates.some(u => u._id === sourceItem.id)) {
		// 	sortingUpdates.push({ _id: sourceItem.id, "flags.gcsga.container": container?.id ?? null })
		// }
		//
		// await this.actor.updateEmbeddedDocuments("Item", sortingUpdates)
	}

	private _onResetAll(event: MouseEvent): Promise<TActor | undefined> | void {
		const element = event.currentTarget ?? null
		if (!(element instanceof HTMLAnchorElement)) return

		const type = element.dataset.type

		switch (type) {
			case "attributes": {
				const def = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`)
				return this.actor.update({ "system.settings.attributes": def })
			}
			case "resource-trackers": {
				const def = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`)
				return this.actor.update({ "system.settings.resource_trackers": def })
			}
			case "move-types": {
				const def = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`)
				return this.actor.update({ "system.settings.move_types": def })
			}
			case "locations": {
				const def = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`)
				return this.actor.update({ "system.settings.body_type": def })
			}
			default:
				return
		}
	}

	public getReservedIds(): string[] {
		return [
			...this.actor.system.settings.attributes,
			...this.actor.system.settings.resource_trackers,
			...this.actor.system.settings.move_types,
		].map(e => e.id)
	}

	private async _openClientSideImport(event: Event): Promise<void> {
		const element = event.currentTarget
		if (!(element instanceof HTMLInputElement)) return

		// Get filename of file
		this.filename = element.value.split(/\\|\//).pop() ?? ""
		const files = element.files
		if (!files) return console.error("No file provided for import.")
		await readTextFromFile(files[0]).then(text => {
			this.file = { text, name: files[0].name, path: element.value }
		})

		// Refresh view
		this.render()
	}

	private _openServerSideImport(event: MouseEvent): void {
		event.preventDefault()
		const filepicker = new FilePickerGURPS({
			callback: (path: string) => {
				const request = new XMLHttpRequest()
				request.open("GET", path)
				new Promise(resolve => {
					request.onload = () => {
						if (request.status === 200) {
							const text = request.response
							this.file = {
								text: text,
								name: path,
								path: request.responseURL,
							}
							this.filename = String(path).split(/\\|\//).pop() || ""
							this.render()
						}
						resolve(this)
					}
				})
				request.send(null)
			},
		})
		filepicker.extensions = [".gcs", ".xml", ".gca5"]
		console.log(filepicker)
		filepicker.render(true)
	}

	private _onImportConfirm(): void {
		if (!this.file) return console.error("No file provided for import.")
		const file = this.file
		delete this.file
		this.filename = ""
		CharacterImporter.importCharacter(this.actor, file)
		if (this.actor.sheet.rendered) this.actor.sheet.render()
	}

	private _onReImport(): void {
		const importPath = this.actor.importData.path
		const importName = importPath.match(/.*[/\\]Data[/\\](.*)/)
		const filePath = importName?.[1].replace(/\\/g, "/") || this.object.importData.name

		const request = new XMLHttpRequest()
		request.open("GET", filePath)

		new Promise(resolve => {
			request.onload = () => {
				if (request.status === 200) {
					const text = request.response
					CharacterImporter.importCharacter(this.object, {
						text: text,
						name: filePath,
						path: importPath,
					})
				}
				resolve(this)
			}
		})
		request.send(null)
	}

	// override async _onDragStart(event: DragEvent): Promise<void> {
	// 	const element = event.currentTarget
	// 	if (!(element instanceof HTMLElement)) return
	//
	// 	const type = element.dataset.type as DropDataType
	//
	// 	const index = parseInt(element.dataset.index ?? "")
	// 	if (isNaN(index)) return console.error("Invalid index")
	//
	// 	const parentIndex = parseInt(element.dataset.pindex ?? "")
	//
	// 	event.dataTransfer?.setData(
	// 		DnD.TEXT_PLAIN,
	// 		JSON.stringify({
	// 			type,
	// 			index,
	// 			parentIndex: isNaN(parentIndex) ? 0 : parentIndex,
	// 		}),
	// 	)
	// }

	// protected override _onDragOver(event: DragEvent): void {
	// 	super._onDragOver(event)
	// 	const element = event.currentTarget
	// 	if (!(element instanceof HTMLElement)) return
	// 	if (!element.classList.contains("item")) return
	//
	// 	const heightAcross = (event.offsetY - element.offsetTop) / element.offsetHeight
	// 	for (const item of htmlQueryAll(element.parentElement, ".item")) {
	// 		item.classList.remove("border-top")
	// 		item.classList.remove("border-bottom")
	// 	}
	// 	if (heightAcross > 0.5) {
	// 		element.classList.remove("border-top")
	// 		element.classList.add("border-bottom")
	// 	} else {
	// 		element.classList.remove("border-bottom")
	// 		element.classList.add("border-top")
	// 	}
	// }

	// 	protected override async _onDrop(event: DragEvent): Promise<void> {
	// 		const dragData = DnD.getDragData(event, DnD.TEXT_PLAIN)
	//
	// 		console.log(dragData)
	//
	// 		if (dragData.type === DropDataType.Damage) return
	// 		if (dragData.type === DropDataType.Item) return
	// 		if (dragData.type === DropDataType.Effect) return
	// 		if (dragData.type === DropDataType.SubTable) return
	//
	// 		let element = event.target
	// 		if (!(element instanceof HTMLElement)) return console.error("Drop event target is not valid.")
	// 		while (!element.classList.contains("item")) {
	// 			element = htmlClosest(element, ".item")
	// 			if (!(element instanceof HTMLElement)) return console.error("Drop event target is not valid.")
	// 		}
	//
	// 		const targetIndex = parseInt(element.dataset.index ?? "")
	// 		if (isNaN(targetIndex)) return console.error("Drop target index is not valid", element)
	//
	// 		const above = element.classList.contains("border-top")
	// 		if (above && dragData.order === targetIndex - 1) return
	// 		if (!above && dragData.order === targetIndex + 1) return
	//
	// 		const context: DropDataContext = {
	// 			element,
	// 			app: this,
	// 			targetIndex,
	// 		}
	//
	// 		switch (dragData.type) {
	// 			case DropDataType.Attribute:
	// 				return SettingsHelpers.onDropAttribute(dragData, context)
	// 			case DropDataType.AttributeThreshold:
	// 				return SettingsHelpers.onDropAttributeThreshold(dragData, context)
	// 			case DropDataType.ResourceTracker:
	// 				return SettingsHelpers.onDropResourceTracker(dragData, context)
	// 			case DropDataType.ResourceTrackerThreshold:
	// 				return SettingsHelpers.onDropResourceTrackerThreshold(dragData, context)
	// 			case DropDataType.MoveType:
	// 				return SettingsHelpers.onDropMoveType(dragData, context)
	// 			case DropDataType.MoveTypeOverride:
	// 				return SettingsHelpers.onDropMoveTypeOverride(dragData, context)
	// 			case DropDataType.HitLocation:
	// 				return SettingsHelpers.onDropHitLocation(dragData, context)
	// 		}
	// 	}
}

interface CharacterConfigSheetData<TActor extends CharacterGURPS = CharacterGURPS> extends DocumentSheetData<TActor> {
	actor: TActor
	system: TActor["system"]
	settings: Record<string, unknown>
	attributes: Record<string, AbstractAttributeDef[]>
	filename: string
	config: ConfigGURPS["GURPS"]
	flags: CharacterFlags[typeof SYSTEM_NAME]
}

export { CharacterConfigSheet }
