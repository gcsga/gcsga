import { SETTINGS, SYSTEM_NAME } from "@module/data/constants.ts"
import { CharacterGURPS } from "./document.ts"
import {
	AbstractAttributeDef,
	AttributeDef,
	BodyGURPS,
	HitLocation,
	HitLocationObj,
	MoveTypeDef,
	PoolThreshold,
	RESERVED_IDS,
	ResourceTrackerDef,
} from "@system"
import { CharacterImporter, PDF, htmlQuery, htmlQueryAll, prepareFormData, sanitizeId } from "@util"
import { FilePickerGURPS } from "@module/apps/file-picker.ts"
import { MoveTypeOverride } from "@system/move-type/override.ts"

class CharacterConfigSheet<TActor extends CharacterGURPS> extends DocumentSheet<TActor> {
	// Display this filename in the import button text before importing
	declare filename: string
	declare file?: { text: string; name: string; path: string }
	private declare reservedIds: string[]

	get actor(): TActor {
		return this.object
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
		}
	}

	override activateListeners($html: JQuery): void {
		super.activateListeners($html)
		const html = $html[0]

		// Open PDF links
		for (const ref of htmlQueryAll(html, "a.ref")) ref.addEventListener("click", ev => PDF.handle(ev))

		// Reset section to defaults
		htmlQuery(html, "a[data-action=reset-all]")?.addEventListener("click", ev => this._onResetAll(ev))

		// Validate IDs for attributes and hit locations
		for (const input of htmlQueryAll(html, "input[name$='.id']")) {
			input.addEventListener("input", ev => this._validateId(ev))
		}

		// Handle client-side and server-side import
		if (game.settings.get(SYSTEM_NAME, SETTINGS.SERVER_SIDE_FILE_DIALOG))
			htmlQuery(html, "input[type='file']")?.addEventListener("click", () => this._openServerSideImport())
		else htmlQuery(html, "input[type='file']")?.addEventListener("change", ev => this._openClientSideImport(ev))

		// Confirm Import
		htmlQuery(html, "button[data-action=import-confirm]")?.addEventListener("click", () => this._onImportConfirm())

		// Displaattributesy drop indicators
		for (const item of htmlQueryAll(html, ".item")) item.addEventListener("dragover", ev => this._onDragItem(ev))

		for (const button of htmlQueryAll(html, "a[data-action^=add-]")) {
			switch (button.dataset.action) {
				case "add-attribute":
					button.addEventListener("click", () => this._addAttribute())
					break
				case "add-attribute-threshold":
					button.addEventListener("click", ev => this._addAttributeThreshold(ev))
					break
				case "add-resource-tracker":
					button.addEventListener("click", () => this._addResourceTracker())
					break
				case "add-resource-tracker-threshold":
					button.addEventListener("click", ev => this._addResourceTrackerThreshold(ev))
					break
				case "add-move-type":
					button.addEventListener("click", () => this._addMoveType())
					break
				case "add-move-type-override":
					button.addEventListener("click", ev => this._addMoveTypeOverride(ev))
					break
				case "add-location":
					button.addEventListener("click", ev => this._addHitLocation(ev))
					break
				case "add-sub-table":
					button.addEventListener("click", ev => this._addSubtable(ev))
					break
			}
		}

		for (const button of htmlQueryAll(html, "a[data-action^=remove-]")) {
			switch (button.dataset.action) {
				case "remove-attribute":
					button.addEventListener("click", ev => this._removeAttribute(ev))
					break
				case "remove-attribute-threshold":
					button.addEventListener("click", ev => this._removeAttributeThreshold(ev))
					break
				case "remove-resource-tracker":
					button.addEventListener("click", ev => this._removeResourceTracker(ev))
					break
				case "remove-resource-tracker-threshold":
					button.addEventListener("click", ev => this._removeResourceTrackerThreshold(ev))
					break
				case "remove-move-type":
					button.addEventListener("click", ev => this._removeMoveType(ev))
					break
				case "remove-move-type-override":
					button.addEventListener("click", ev => this._removeMoveTypeOverride(ev))
					break
				case "remove-location":
					button.addEventListener("click", ev => this._removeHitLocation(ev))
					break
				case "remove-sub-table":
					button.addEventListener("click", ev => this._removeSubtable(ev))
					break
			}
		}
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

	private _getReservedIds(): string[] {
		return [
			...this.actor.system.settings.attributes,
			...this.actor.system.settings.resource_trackers,
			...this.actor.system.settings.move_types,
		].map(e => e.id)
	}

	private _validateId(event: Event): void {
		const element = event.currentTarget ?? null
		if (!(element instanceof HTMLInputElement && event instanceof InputEvent)) return

		const value = element.value
		const name = element.name

		let invalid = value === ""

		if (name.includes("locations")) invalid = HitLocation.validateId(value)
		else {
			invalid ||= sanitizeId(value, false, RESERVED_IDS) !== value

			if (name.includes("attributes")) {
				invalid ||= this.actor.settings.attributes.some(
					(e, index) => e.id === value && !name.endsWith(`attributes.${index}.id`),
				)
			} else if (name.includes("resource_trackers")) {
				invalid ||= this.actor.settings.resource_trackers.some(
					(e, index) => e.id === value && !name.endsWith(`resource_trackers.${index}.id`),
				)
			} else if (name.includes("move_types")) {
				invalid ||= this.actor.settings.move_types.some(
					(e, index) => e.id === value && !name.endsWith(`move_types.${index}.id`),
				)
			}
		}
		if (invalid) element.classList.add("invalid")
		else element.classList.remove("invalid")
	}

	private _openClientSideImport(event: Event): void {
		const element = event.currentTarget
		if (!(element instanceof HTMLInputElement)) return

		// Get filename of file
		this.filename = element.value.split(/\\|\//).pop() ?? ""
		const files = element.files
		if (!files) return console.error("No file provided for import.")
		readTextFromFile(files[0]).then(text => {
			this.file = { text, name: files[0].name, path: element.value }
		})
		// Refresh view
		this.render()
	}

	private _openServerSideImport(): void {
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
		filepicker.extension = [".gcs", ".xml", ".gca5"]
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

	private _addAttribute(): void {
		const attributes = this.actor.system.settings.attributes
		attributes.push(AttributeDef.newObject(this._getReservedIds()))
		this.actor.update({ "system.settings.attributes": attributes })
	}

	private _removeAttribute(event: MouseEvent): void {
		const element = event.currentTarget
		if (!(element instanceof HTMLAnchorElement)) return

		const index = Number(element.dataset.index) ?? null
		if (!(typeof index === "number")) return console.error("Invalid index")

		const attributes = this.actor.system.settings.attributes
		attributes.splice(index, 1)
		this.actor.update({ "system.settings.attributes": attributes })
	}

	private _addAttributeThreshold(event: MouseEvent): void {
		const element = event.currentTarget
		if (!(element instanceof HTMLAnchorElement)) return

		const index = Number(element.dataset.index) ?? null
		if (!(typeof index === "number")) return console.error("Invalid index")

		const attributes = this.actor.system.settings.attributes
		attributes[index].thresholds?.push(PoolThreshold.newObject())
		this.actor.update({ "system.settings.attributes": attributes })
	}

	private _removeAttributeThreshold(event: MouseEvent): void {
		const element = event.currentTarget
		if (!(element instanceof HTMLAnchorElement)) return

		const pindex = Number(element.dataset.pindex) ?? null
		if (!(typeof pindex === "number")) return console.error("Invalid index")

		const index = Number(element.dataset.index) ?? null
		if (!(typeof index === "number")) return console.error("Invalid index")

		const attributes = this.actor.system.settings.attributes
		attributes[pindex].thresholds?.splice(index, 1)
		this.actor.update({ "system.settings.attributes": attributes })
	}

	private _addResourceTracker(): void {
		const resourceTrackers = this.actor.system.settings.resource_trackers

		resourceTrackers.push(ResourceTrackerDef.newObject(this._getReservedIds()))
		this.actor.update({ "system.settings.resource_trackers": resourceTrackers })
	}

	private _removeResourceTracker(event: MouseEvent): void {
		const element = event.currentTarget
		if (!(element instanceof HTMLAnchorElement)) return

		const index = Number(element.dataset.index) ?? null
		if (!(typeof index === "number")) return console.error("Invalid index")

		const resourceTrackers = this.actor.system.settings.resource_trackers
		resourceTrackers.splice(index, 1)

		this.actor.update({ "system.settings.resource_trackers": resourceTrackers })
	}

	private _addResourceTrackerThreshold(event: MouseEvent): void {
		const element = event.currentTarget
		if (!(element instanceof HTMLAnchorElement)) return

		const index = Number(element.dataset.index) ?? null
		if (!(typeof index === "number")) return console.error("Invalid index")

		const resourceTrackers = this.actor.system.settings.resource_trackers
		resourceTrackers[index].thresholds?.push(PoolThreshold.newObject())
		this.actor.update({ "system.settings.resource_trackers": resourceTrackers })
	}

	private _removeResourceTrackerThreshold(event: MouseEvent): void {
		const element = event.currentTarget
		if (!(element instanceof HTMLAnchorElement)) return

		const pindex = Number(element.dataset.pindex) ?? null
		if (!(typeof pindex === "number")) return console.error("Invalid index")

		const index = Number(element.dataset.index) ?? null
		if (!(typeof index === "number")) return console.error("Invalid index")

		const resourceTrackers = this.actor.system.settings.resource_trackers
		resourceTrackers[pindex].thresholds?.splice(index, 1)
		this.actor.update({ "system.settings.resource_trackers": resourceTrackers })
	}

	private _addMoveType(): void {
		const moveTypes = this.actor.system.settings.move_types
		moveTypes.push(MoveTypeDef.newObject(this._getReservedIds()))
		this.actor.update({ "system.settings.move_types": moveTypes })
	}

	private _removeMoveType(event: MouseEvent): void {
		const element = event.currentTarget
		if (!(element instanceof HTMLAnchorElement)) return

		const index = Number(element.dataset.index) ?? null
		if (!(typeof index === "number")) return console.error("Invalid index")

		const moveTypes = this.actor.system.settings.move_types
		moveTypes.splice(index, 1)
		this.actor.update({ "system.settings.move_types": moveTypes })
	}

	private _addMoveTypeOverride(event: MouseEvent): void {
		const element = event.currentTarget
		if (!(element instanceof HTMLAnchorElement)) return

		const index = Number(element.dataset.index) ?? null
		if (!(typeof index === "number")) return console.error("Invalid index")

		const moveTypes = this.actor.system.settings.move_types
		moveTypes[index].overrides?.push(MoveTypeOverride.newObject())
		this.actor.update({ "system.settings.move_types": moveTypes })
	}

	private _removeMoveTypeOverride(event: MouseEvent): void {
		const element = event.currentTarget
		if (!(element instanceof HTMLAnchorElement)) return

		const pindex = Number(element.dataset.pindex) ?? null
		if (!(typeof pindex === "number")) return console.error("Invalid index")

		const index = Number(element.dataset.index) ?? null
		if (!(typeof index === "number")) return console.error("Invalid index")

		const moveTypes = this.actor.system.settings.move_types
		moveTypes[pindex].overrides?.splice(index, 1)
		this.actor.update({ "system.settings.move_types": moveTypes })
	}

	private _addHitLocation(event: MouseEvent): void {
		const element = event.currentTarget
		if (!(element instanceof HTMLAnchorElement)) return

		const path = (element.dataset.path ?? "").replace(/^array\./, "")
		if (!(typeof path === "string")) return
		const index = Number(element.dataset.index) ?? null
		if (!(typeof index === "number")) return console.error("Invalid index")

		const table = fu.getProperty(this.actor, `${path}.locations`) as HitLocationObj[]
		if (!Array.isArray(table)) return

		table.push(HitLocation.newObject())
		this._updateObject(event, { [`array.${path}`]: table })
	}

	private _removeHitLocation(event: MouseEvent): void {
		const element = event.currentTarget
		if (!(element instanceof HTMLAnchorElement)) return

		const path = (element.dataset.path ?? "").replace(/^array\./, "")
		if (!(typeof path === "string")) return
		const index = Number(element.dataset.index) ?? null
		if (!(typeof index === "number")) return console.error("Invalid index")

		const table = fu.getProperty(this.actor, `${path}.locations`) as HitLocationObj[]
		if (!Array.isArray(table)) return

		table.splice(index, 1)
		this._updateObject(event, { [`array.${path}`]: table })
	}

	private _addSubtable(event: MouseEvent): void {
		const element = event.currentTarget
		if (!(element instanceof HTMLAnchorElement)) return

		const path = (element.dataset.path ?? "").replace(/^array\./, "")
		if (!(typeof path === "string")) return
		const index = Number(element.dataset.index) ?? null
		if (!(typeof index === "number")) return console.error("Invalid index")

		const table = fu.getProperty(this.actor, path) as HitLocationObj[]
		table[index].sub_table = BodyGURPS.newObject()
		if (!Array.isArray(table)) return

		table.push(HitLocation.newObject())
		this._updateObject(event, { [`array.${path}`]: table })
	}

	private _removeSubtable(event: MouseEvent): void {
		const element = event.currentTarget
		if (!(element instanceof HTMLAnchorElement)) return

		const path = (element.dataset.path ?? "").replace(/^array\./, "")
		if (!(typeof path === "string")) return
		const index = Number(element.dataset.index) ?? null
		if (!(typeof index === "number")) return

		const table = fu.getProperty(this.actor, path) as HitLocationObj[]
		if (!Array.isArray(table)) return

		delete table[index].sub_table
		this._updateObject(event, { [`array.${path}`]: table })
	}

	protected _onDragItem(event: DragEvent): void {
		const element = event.currentTarget
		if (!(element instanceof HTMLElement)) return

		const heightAcross = (event.pageY - element.offsetTop) / element.offsetHeight
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

	protected override _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
		const element = event.currentTarget
		if (!(element instanceof HTMLElement)) return super._updateObject(event, {})

		if (element instanceof HTMLInputElement)
			if (element.classList.contains("invalid")) delete formData[element.name]

		if (formData["system.settings.block_layout"])
			formData["system.settings.block_layout"] = (formData["system.settings.block_layout"] as string)
				.split("\n")
				.map(e => e.trim())

		formData = prepareFormData(formData, this.actor)
		return super._updateObject(event, formData)
	}
}

interface CharacterConfigSheetData<TActor extends CharacterGURPS = CharacterGURPS> extends DocumentSheetData<TActor> {
	actor: TActor
	system: TActor["system"]
	settings: Record<string, unknown>
	attributes: Record<string, AbstractAttributeDef[]>
	filename: string
	config: ConfigGURPS["GURPS"]
}

export { CharacterConfigSheet }
