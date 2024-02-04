import { AttributeDefObj } from "@sytem/attribute/data.ts"
import { CharacterGURPS } from "./document.ts"
import { ResourceTrackerDefObj } from "@sytem/resource_tracker/data.ts"
import { HitLocationData, HitLocationTable, HitLocationTableData } from "./hit_location.ts"
import { MoveTypeDefObj, MoveTypeOverrideConditionType } from "@sytem/move_type/data.ts"
import { SETTINGS, SYSTEM_NAME, gid } from "@module/data/misc.ts"
import { FilePickerGURPS, LocalizeGURPS, PDF, getNewAttributeId, prepareFormData } from "@util"
import { GURPSCONFIG } from "@scripts/config/index.ts"
import { attribute } from "@util/enum/attribute.ts"
import { CharacterImporter } from "./import.ts"
import { DnD } from "@util/drag_drop.ts"
import { DropDataType } from "@module/apps/damage_calculator/damage_chat_message.ts"

type ListType =
	| DropDataType.Attributes
	| DropDataType.ResourceTrackers
	| DropDataType.AttributeThresholds
	| DropDataType.TrackerThresholds
	| DropDataType.Locations
	| DropDataType.SubTable
	| DropDataType.MoveType
	| DropDataType.Overrides

type CharacterSheetConfigOptions = FormApplicationOptions & {}

interface CharacterSheetConfigData<TActor extends CharacterGURPS> extends FormApplicationData<TActor> {
	actor: TActor["_source"]
	system: TActor["system"]
	attributes: AttributeDefObj[]
	resource_trackers: ResourceTrackerDefObj[]
	move_types: MoveTypeDefObj[]
	locations: HitLocationTableData
	filename: string
	config: typeof GURPSCONFIG
}

export interface CharacterSheetConfig<
	TActor extends CharacterGURPS = CharacterGURPS,
	TOptions extends CharacterSheetConfigOptions = CharacterSheetConfigOptions,
> extends FormApplication<TActor, TOptions> {
	object: TActor
}

export class CharacterSheetConfig<
	TActor extends CharacterGURPS = CharacterGURPS,
	TOptions extends CharacterSheetConfigOptions = CharacterSheetConfigOptions,
> extends FormApplication<TActor, TOptions> {
	filename: string

	file?: { text: string; name: string; path: string }

	attributes: AttributeDefObj[]

	resource_trackers: ResourceTrackerDefObj[]

	bodyType: HitLocationTable

	move_types: MoveTypeDefObj[]

	constructor(object: TActor, options?: Partial<TOptions>) {
		super(object, options)
		this.object = object
		this.filename = ""
		this.attributes = this.object.system.settings.attributes
		this.resource_trackers = this.object.system.settings.resource_trackers
		this.move_types = this.object.system.settings.move_types
		this.bodyType = this.object.BodyType
	}

	static override get defaultOptions(): FormApplicationOptions {
		return fu.mergeObject(super.defaultOptions, {
			classes: ["form", "character-config", "gurps"],
			template: `systems/${SYSTEM_NAME}/templates/actor/character/config/config.hbs`,
			width: 540,
			resizable: true,
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

	override getData(options?: Partial<FormApplicationOptions> | undefined): CharacterSheetConfigData<TActor> {
		super.getData()
		const actor = this.object
		this.attributes = this.object.system.settings.attributes
		this.resource_trackers = this.object.system.settings.resource_trackers
		this.move_types = this.object.system.settings.move_types
		// const attributes = actor.settings.attributes.map(e =>
		// 	mergeObject(e, { order: actor.attributes.get(e.id)!.order })
		// )
		// const resourceTrackers = actor.settings.resource_trackers

		return {
			options: options,
			actor: actor.toObject(),
			system: actor.system,
			attributes: this.attributes,
			resource_trackers: this.resource_trackers,
			move_types: this.move_types,
			locations: actor.system.settings.body_type,
			filename: this.filename,
			config: CONFIG.GURPS,
		}
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)
		html.find("textarea")
			.each(function () {
				this.setAttribute("style", `height:${this.scrollHeight + 2}px;overflow-y:hidden;`)
			})
			.on("input", event => {
				const e = event.currentTarget
				e.style.height = "0px"
				e.style.height = `${e.scrollHeight + 2}px`
			})

		html.find(".ref").on("click", event => PDF.handle(event))
		html.find("a.reset-all").on("click", event => this._onReset(event))
		html.find("input[name$='.id']").on("input", event => {
			const value = $(event.currentTarget).val()
			const name = $(event.currentTarget).prop("name")
			let invalid = false
			if (value === "") invalid = true
			if (name.includes("locations")) {
				if (value === gid.All) invalid = true
			} else {
				this.attributes.forEach((e, i) => {
					if (e.id === value && name !== `attributes.${i}.id`) invalid = true
				})
				this.resource_trackers.forEach((e, i) => {
					if (e.id === value && name !== `resource_trackers.${i}.id`) invalid = true
				})
			}
			if (invalid) $(event.currentTarget).addClass("invalid")
			else $(event.currentTarget).removeClass("invalid")
		})
		// Re-uploading old character
		html.find(".quick-import").on("click", event => this._reimport(event))

		// Uploading new character
		if (game.settings.get(SYSTEM_NAME, SETTINGS.SERVER_SIDE_FILE_DIALOG)) {
			html.find("input[type='file']").on("click", event => {
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
				filepicker.extension = [".gcs", ".xml", ".gca5"]
				filepicker.render(true)
			})
		} else {
			html.find("input[type='file']").on("change", event => {
				const filename = String($(event.currentTarget).val()).split(/\\|\//).pop() || ""
				const files = $(event.currentTarget).prop("files")
				this.filename = filename
				if (files) {
					fu.readTextFromFile(files[0]).then(
						text =>
							(this.file = {
								text: text,
								name: files[0].name,
								path: files[0].path,
							}),
					)
				}
				this.render()
			})
		}
		html.find(".import-confirm").on("click", event => this._import(event))
		html.find(".item").on("dragover", event => this._onDragItem(event))
		html.find(".add").on("click", event => this._onAddItem(event))
		html.find(".delete").on("click", event => this._onDeleteItem(event))
		html.find(".export").on("click", event => this._onExport(event))
		html.find(".data-import").on("click", event => this._onDataImport(event))
		html.find(".data-export").on("click", event => this._onDataExport(event))
	}

	async _onReset(event: JQuery.ClickEvent): Promise<this> {
		event.preventDefault()
		const type = $(event.currentTarget).data("type")
		const default_attributes = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`)
		const default_resource_trackers = game.settings.get(
			SYSTEM_NAME,
			`${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`,
		)
		const default_hit_locations = {
			name: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.name`),
			roll: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.roll`),
			locations: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`),
		}
		const default_move_types = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`)
		const update: Record<string, unknown> = {}
		if (type === "attributes") update["system.settings.attributes"] = default_attributes
		if (type === "resource_trackers") update["system.settings.resource_trackers"] = default_resource_trackers
		if (type === "locations") update["system.settings.body_type"] = default_hit_locations
		if (type === "move_types") update["system.settings.move_types"] = default_move_types
		await this.object.update(update)
		return this.render()
	}

	_onExport(event: JQuery.ClickEvent): Promise<void> {
		event.preventDefault()
		return this.object.saveLocal()
	}

	_onDataImport(event: JQuery.ClickEvent): void {
		event.preventDefault()
	}

	_onDataExport(event: JQuery.ClickEvent): Promise<void> {
		event.preventDefault()
		switch ($(event.currentTarget).data("type") as "attributes" | "locations") {
			case "attributes":
				return this.object.saveLocal("settings.attributes", "attr")
			case "locations":
				return this.object.saveLocal("settings.body_type", "body")
		}
	}

	async _onAddItem(event: JQuery.ClickEvent): Promise<this | void> {
		event.preventDefault()
		event.stopPropagation()
		let path = ""
		let locations: HitLocationData[] = []
		const type: ListType = $(event.currentTarget).data("type")
		let new_id = ""
		if ([DropDataType.Attributes, DropDataType.ResourceTrackers, DropDataType.MoveType].includes(type))
			new_id = getNewAttributeId([...this.attributes, ...this.resource_trackers, ...this.move_types])
		let formData: Record<string, unknown> = {}
		switch (type) {
			case DropDataType.Attributes:
				this.attributes.push({
					type: attribute.Type.Integer,
					id: new_id,
					name: "",
					attribute_base: "",
					cost_per_point: 0,
					cost_adj_percent_per_sm: 0,
				})
				await this.object.update({ "system.settings.attributes": this.attributes })
				return this.render()
			case DropDataType.ResourceTrackers:
				this.resource_trackers.push({
					id: new_id,
					name: "",
					full_name: "",
					max: 0,
					isMaxEnforced: false,
					min: 0,
					isMinEnforced: false,
					thresholds: [],
				})
				await this.object.update({ "system.settings.resource_trackers": this.resource_trackers })
				return this.render()
			case DropDataType.AttributeThresholds:
				this.attributes[$(event.currentTarget).data("id")].thresholds ??= []
				this.attributes[$(event.currentTarget).data("id")].thresholds!.push({
					state: "",
					explanation: "",
					expression: "",
					ops: [],
				})
				await this.object.update({ "system.settings.attributes": this.attributes })
				return this.render()
			case DropDataType.TrackerThresholds:
				this.resource_trackers[$(event.currentTarget).data("id")].thresholds ??= []
				this.resource_trackers[$(event.currentTarget).data("id")].thresholds!.push({
					state: "",
					explanation: "",
					expression: "",
					ops: [],
				})
				await this.object.update({ "system.settings.resource_trackers": this.resource_trackers })
				return this.render()
			case DropDataType.Locations:
				path = $(event.currentTarget).data("path").replace("array.", "")
				locations = (fu.getProperty(this.object, `${path}.locations`) as HitLocationData[]) ?? []
				locations.push({
					id: LocalizeGURPS.translations.gurps.placeholder.hit_location.id,
					choice_name: LocalizeGURPS.translations.gurps.placeholder.hit_location.choice_name,
					table_name: LocalizeGURPS.translations.gurps.placeholder.hit_location.table_name,
					slots: 0,
					hit_penalty: 0,
					dr_bonus: 0,
					description: "",
				})
				formData ??= {}
				formData[`array.${path}.locations`] = locations
				await this._updateObject(event as unknown as Event, formData)
				return this.render()
			case DropDataType.SubTable: {
				path = $(event.currentTarget).data("path").replace("array.", "")
				const index = Number($(event.currentTarget).data("index"))
				locations = (fu.getProperty(this.object, `${path}`) as HitLocationData[]) ?? []
				locations[index].sub_table = {
					name: "",
					roll: "1d",
					locations: [
						{
							id: LocalizeGURPS.translations.gurps.placeholder.hit_location.id,
							choice_name: LocalizeGURPS.translations.gurps.placeholder.hit_location.choice_name,
							table_name: LocalizeGURPS.translations.gurps.placeholder.hit_location.table_name,
							slots: 0,
							hit_penalty: 0,
							dr_bonus: 0,
							description: "",
						},
					],
				}
				formData ??= {}
				formData[`array.${path}`] = locations
				await this._updateObject(event as unknown as Event, formData)
				return this.render()
			}
			case DropDataType.MoveType:
				this.move_types.push({
					id: new_id,
					name: "",
					move_type_base: "",
					cost_per_point: 0,
					overrides: [],
				})
				await this.object.update({ "system.settings.move_types": this.move_types })
				return this.render()
			case DropDataType.Overrides:
				this.move_types[$(event.currentTarget).data("id")].overrides ??= []
				this.move_types[$(event.currentTarget).data("id")].overrides.push({
					condition: {
						type: MoveTypeOverrideConditionType.Condition,
						qualifier: "",
					},
					move_type_base: "",
				})
				await this.object.update({ "system.settings.move_types": this.move_types })
				return this.render()
		}
	}

	private async _onDeleteItem(event: JQuery.ClickEvent) {
		event.preventDefault()
		event.stopPropagation()
		const path = $(event.currentTarget).data("path")?.replace("array.", "")
		let locations = []
		let formData: Record<string, unknown> = {}
		const type: ListType = $(event.currentTarget).data("type")
		const index = Number($(event.currentTarget).data("index")) || 0
		const parent_index = Number($(event.currentTarget).data("pindex")) || 0
		switch (type) {
			case DropDataType.Attributes:
			case DropDataType.ResourceTrackers:
			case DropDataType.MoveType:
				this[type].splice(index, 1)
				await this.object.update({ [`system.settings.${type}`]: this[type] })
				return this.render()
			case DropDataType.AttributeThresholds:
			case DropDataType.TrackerThresholds: {
				const list = type === "attribute_thresholds" ? "attributes" : "resource_trackers"
				this[list][parent_index].thresholds?.splice(index, 1)
				await this.object.update({ [`system.settings.${list}`]: this[list] })
				return this.render()
			}
			case DropDataType.Overrides:
				this.move_types[parent_index].overrides?.splice(index, 1)
				await this.object.update({ "system.settings.move_types": this.move_types })
				return this.render()
			case DropDataType.Locations:
				locations = (fu.getProperty(this.object, `${path}`) as HitLocationData[]) ?? []
				locations.splice($(event.currentTarget).data("index"), 1)
				formData ??= {}
				formData[`array.${path}`] = locations
				await this._updateObject(event as unknown as Event, formData)
				return this.render()
			case DropDataType.SubTable: {
				locations = (fu.getProperty(this.object, `${path}`) as HitLocationData[]) ?? []
				delete locations[index].sub_table
				formData ??= {}
				formData[`array.${path}`] = locations
				await this._updateObject(event as unknown as Event, formData)
				return this.render()
			}
		}
	}

	protected async _reimport(event: JQuery.ClickEvent): Promise<void> {
		event.preventDefault()
		const import_path = this.object.importData.path
		const import_name = import_path.match(/.*[/\\]Data[/\\](.*)/)
		const file_path = import_name?.[1].replace(/\\/g, "/") || this.object.importData.name
		const request = new XMLHttpRequest()
		request.open("GET", file_path)

		new Promise(resolve => {
			request.onload = () => {
				if (request.status === 200) {
					const text = request.response
					CharacterImporter.import(this.object, {
						text: text,
						name: file_path,
						path: import_path,
					})
				}
				resolve(this)
			}
		})
		request.send(null)
	}

	protected async _import(event: JQuery.ClickEvent): Promise<void> {
		event.preventDefault()
		if (this.file) {
			const file = this.file
			this.file = undefined
			this.filename = ""
			CharacterImporter.import(this.object, file)
		}
	}

	protected override _getHeaderButtons(): ApplicationHeaderButton[] {
		const all_buttons = [...super._getHeaderButtons()]
		all_buttons.at(-1)!.label = ""
		all_buttons.at(-1)!.icon = "gcs-circled-x"
		return all_buttons
	}

	protected async _updateObject(event: Event, formData: Record<string, unknown>): Promise<unknown> {
		const element = $(event.currentTarget!)
		if (element.hasClass("invalid")) delete formData[element.prop("name")]
		formData = prepareFormData(formData, this.object)
		if (!this.object.id) return
		if (formData["system.settings.block_layout"])
			formData["system.settings.block_layout"] = (formData["system.settings.block_layout"] as string).split("\n")
		await this.object.update(formData)
		return this.render()
	}

	override async _onDragStart(event: DragEvent): Promise<void> {
		const item = $(event.currentTarget!)
		const type = item.data("type")
		const index = Number(item.data("index"))
		const parent_index = Number(item.data("pindex")) || 0
		event.dataTransfer?.setData(
			"text/plain",
			JSON.stringify({
				type: type,
				index: index,
				parent_index: parent_index,
			}),
		)
		// event.dragType = type
	}

	protected _onDragItem(event: JQuery.DragOverEvent): void {
		const element = $(event.currentTarget!)
		const heightAcross = (event.pageY! - element.offset()!.top) / element.height()!
		element.siblings(".item").removeClass("border-top").removeClass("border-bottom")
		if (heightAcross > 0.5) {
			element.removeClass("border-top")
			element.addClass("border-bottom")
		} else {
			element.removeClass("border-bottom")
			element.addClass("border-top")
		}
	}

	protected override async _onDrop(event: DragEvent): Promise<unknown> {
		const dragData = DnD.getDragData(event, DnD.TEXT_PLAIN)
		if (dragData.type === DropDataType.Damage) return
		if (dragData.type === DropDataType.Item) return

		let element = $(event.target!)
		if (!element.hasClass("item")) element = element.parent(".item")

		const target_index = element.data("index")
		const above = element.hasClass("border-top")
		if (dragData.order === target_index) return this.render()
		if (above && dragData.order === target_index - 1) return this.render()
		if (!above && dragData.order === target_index + 1) return this.render()

		const path = element.data("path")?.replace("array.", "")
		switch (dragData.type) {
			case DropDataType.Attributes:
			case DropDataType.AttributeThresholds: {
				const container = this.attributes
				if (dragData.type === DropDataType.AttributeThresholds) {
					const item = container[dragData.parent_index].thresholds?.splice(dragData.index, 1)[0]
					if (item) container[dragData.parent_index].thresholds?.splice(target_index, 0, item)
				} else {
					const item = container.splice(dragData.index, 1)[0]
					if (item) container.splice(target_index, 0, item)
				}
				return this.object.update({ "system.settings.attributes": container })
			}
			case DropDataType.ResourceTrackers:
			case DropDataType.TrackerThresholds: {
				const container = this.resource_trackers
				if (dragData.type === DropDataType.TrackerThresholds) {
					const item = container[dragData.parent_index].thresholds?.splice(dragData.index, 1)[0]
					if (item) container[dragData.parent_index].thresholds?.splice(target_index, 0, item)
				} else {
					const item = container.splice(dragData.index, 1)[0]
					if (item) container.splice(target_index, 0, item)
				}
				return this.object.update({ "system.settings.resource_trackers": container })
			}
			case DropDataType.MoveType:
			case DropDataType.Overrides: {
				const container = this.move_types
				if (dragData.type === DropDataType.Overrides) {
					const item = container[dragData.parent_index].overrides?.splice(dragData.index, 1)[0]
					if (item) container[dragData.parent_index].overrides?.splice(target_index, 0, item)
				} else {
					const item = container.splice(dragData.index, 1)[0]
					if (item) container.splice(target_index, 0, item)
				}
				await this.object.update({ "system.settings.move_types": container })
				await this.object.update({ "system.settings.attributes": container })
				return this.render()
			}
			case DropDataType.Locations:
			case DropDataType.SubTable: {
				const container = fu.getProperty(this.object, path) as HitLocationData[]
				const item = container.splice(dragData.index, 1)[0]
				if (item) container.splice(target_index, 0, item)
				const formData = {
					[`array.${path}`]: container,
				}
				return this._updateObject(event, formData)
			}
		}
		return this.render()
	}

	override close(options?: { force?: boolean }): Promise<void> {
		this.object.sheet.config = null
		return super.close(options)
	}
}
