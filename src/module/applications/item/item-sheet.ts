import { HOOKS, ItemType, SYSTEM_NAME, gid } from "@module/data/constants.ts"
import { AttributeBonus } from "@module/data/feature/attribute-bonus.ts"
import { DRBonusSchema } from "@module/data/feature/dr-bonus.ts"
import { FeatureTypes } from "@module/data/feature/types.ts"
import { ItemTemplateType } from "@module/data/item/types.ts"
import { AttributePrereq } from "@module/data/prereq/index.ts"
import { PrereqList, PrereqListSchema } from "@module/data/prereq/prereq-list.ts"
import { PrereqTypes } from "@module/data/prereq/types.ts"
import { SkillDefault } from "@module/data/item/components/skill-default.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { feature, prereq } from "@util/enum/index.ts"
import { generateId } from "@util/misc.ts"
import { ActiveEffectGURPS } from "@module/document/active-effect.ts"
import { ContextMenuGURPS } from "../context-menu.ts"
import { MaybePromise } from "@module/data/types.ts"
import { Weight } from "@util/weight.ts"
import { SheetSettings } from "@module/data/sheet-settings.ts"
import { ItemCell } from "@module/data/item/components/cell-data.ts"

const { api, sheets } = foundry.applications

class ItemSheetGURPS extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2<ItemGURPS2>) {
	constructor(options = {}) {
		super(options)
		this.#dragDrop = this.#createDragDropHandlers()
	}

	/* -------------------------------------------- */

	#dragDrop: DragDrop[]

	/* -------------------------------------------- */

	get dragDrop(): DragDrop[] {
		return this.#dragDrop
	}

	/* -------------------------------------------- */

	static MODES = {
		PLAY: 1,
		EDIT: 2,
	}

	/* -------------------------------------------- */

	protected _mode = this.constructor.MODES.PLAY

	/* -------------------------------------------- */

	// Set initial values for tabgroups
	override tabGroups: Record<string, string> = {
		primary: "embeds",
	}

	/* -------------------------------------------- */

	static override DEFAULT_OPTIONS: Partial<DocumentSheetConfiguration> & { dragDrop: DragDropConfiguration[] } = {
		tag: "form",
		classes: ["gurps", "item"],
		window: {
			contentClasses: [],
			icon: "gcs-character",
			title: "",
			controls: [],
			resizable: true,
		},
		position: {
			width: 650,
			height: 700,
			// width: "fit-content",
			// height: "auto",
			// scale: 1.5,
		},
		form: {
			submitOnChange: true,
			closeOnSubmit: false,
			handler: this.#onSubmit,
		},
		actions: {
			viewImage: this.#onViewImage,
			editImage: this.#onEditImage,
			addPrereq: this.#onAddPrereq,
			addPrereqList: this.#onAddPrereqList,
			deletePrereq: this.#onDeletePrereq,
			addFeature: this.#onAddFeature,
			deleteFeature: this.#onDeleteFeature,
			toggleDrBonusLocation: this.#onToggleDrBonusLocation,
			addDefault: this.#onAddDefault,
			deleteDefault: this.#onDeleteDefault,
			toggleMode: this.#onToggleMode,
			toggleCheckbox: this.#onToggleCheckbox,
			toggleDropdown: this.#onToggleDropdown,
			openItemContextMenu: this.#onOpenItemContextMenu,
		},
		dragDrop: [{ dragSelector: ".items-list .item", dropSelector: null }],
	}

	/* -------------------------------------------- */

	static override PARTS = {
		header: {
			id: "header",
			template: `systems/${SYSTEM_NAME}/templates/items/parts/item-header.hbs`,
			scrollable: [""],
		},
		description: {
			id: "description",
			template: `systems/${SYSTEM_NAME}/templates/items/tabs/item-description.hbs`,
			scrollable: [""],
		},
		details: {
			id: "details",
			template: `systems/${SYSTEM_NAME}/templates/items/tabs/item-details.hbs`,
			scrollable: [""],
		},
		embeds: {
			id: "embeds",
			template: `systems/${SYSTEM_NAME}/templates/items/tabs/item-embeds.hbs`,
			scrollable: [""],
		},
		replacements: {
			id: "replacements",
			template: `systems/${SYSTEM_NAME}/templates/items/tabs/item-replacements.hbs`,
			scrollable: [""],
		},
	}

	/* -------------------------------------------- */
	/*   Drag & Drop                                */
	/* -------------------------------------------- */

	#createDragDropHandlers() {
		return this.options.dragDrop.map(d => {
			d.permissions = {
				dragstart: this._canDragStart.bind(this),
				drop: this._canDragDrop.bind(this),
			}
			d.callbacks = {
				dragstart: this._onDragStart.bind(this),
				dragover: this._onDragOver.bind(this),
				drop: this._onDrop.bind(this),
			}
			return new DragDrop(d)
		})
	}

	/* -------------------------------------------- */

	protected _canDragStart(_selector: string): boolean {
		return this.isEditable
	}

	/* -------------------------------------------- */

	protected _canDragDrop(_selector: string): boolean {
		return this.isEditable
	}

	/* -------------------------------------------- */

	async _onDragStart(event: DragEvent) {
		const li = event.currentTarget as HTMLElement
		if ((event.target as HTMLElement).classList.contains("content-link")) return

		let dragData

		// Active Effect
		if (li.dataset.effectId) {
			const effect = this.item.effects.get(li.dataset.effectId) as ActiveEffectGURPS
			dragData = effect?.toDragData()
		} else if (this.item.hasTemplate(ItemTemplateType.Container) && li.dataset.itemId) {
			const item = await this.item.system.getContainedItem(li.dataset.itemId)
			dragData = item?.toDragData()
		}

		if (!dragData) return

		// Set data transfer
		event.dataTransfer?.setData("text/plain", JSON.stringify(dragData))
	}

	/* -------------------------------------------- */

	async _onDragOver(_event: DragEvent) {}

	/* -------------------------------------------- */

	protected async _onDrop(event: DragEvent) {
		const data = TextEditor.getDragEventData(event)
		const item = this.item

		const allowed = Hooks.call(`${SYSTEM_NAME}.${HOOKS.DROP_ITEM_SHEET_DATA}`, item, this, data)
		if (allowed === false) return

		switch (data.type) {
			case "ActiveEffect":
				return this._onDropActiveEffect(event, data)
			case "Item":
				return this._onDropItem(event, data)
		}
		return false
	}

	/* -------------------------------------------- */

	protected async _onDropActiveEffect(_event: DragEvent, data: object) {
		const effect = await ActiveEffectGURPS.fromDropData(data)
		if (!this.item.isOwner || !effect || this.item.uuid === effect.parent?.uuid || this.item.uuid === effect.origin)
			return false
		const effectData = effect.toObject()
		const options = { parent: this.item, keepOrigin: false }

		return ActiveEffectGURPS.create(effectData, options)
	}

	/* -------------------------------------------- */

	protected async _onDropItem(event: DragEvent, data: object) {
		if (!this.item.hasTemplate(ItemTemplateType.Container)) return
		const item = await ItemGURPS2.fromDropData(data)
		if (!this.item.isOwner || !item) return
		if (!this.item.system.constructor.contentsTypes.has(item.type as ItemType)) {
			ui.notifications.error("GURPS.Error.InvalidContentsTypeForContainer", { localize: true })
			return
		}

		// If item already exists in this container, just adjust its sorting
		if ((item.system as any).container === this.item.id) {
			return this._onSortItem(event, item)
		}

		// Prevent dropping containers within themselves
		const parentContainers = await this.item.system.allContainers()
		if (this.item.uuid === item.uuid || parentContainers.includes(item as any)) {
			ui.notifications.error("GURPS.Error.ContainerRecursiveError", { localize: true })
			return false
		}

		// If item already exists in same DocumentCollection, just adjust its container property
		if (item.actor === this.item.actor && item.pack === this.item.pack) {
			return await item.update({ folder: this.item.folder, "system.container": this.item.id })!
		}

		// Otherwise, create a new item & contents in this context
		const toCreate = await ItemGURPS2.createWithContents([item], {
			container: this.item as any,
		})
		if (this.item.folder) toCreate.forEach(d => (d.folder = this.item.folder!.id))
		return ItemGURPS2.createDocuments(toCreate, { pack: this.item.pack, parent: this.item.actor, keepId: true })
	}

	/* -------------------------------------------- */

	protected async _onSortItem(event: DragEvent, item: ItemGURPS2) {
		if (!this.item.hasTemplate(ItemTemplateType.Container)) return

		const dropTarget = (event.target as HTMLElement).closest("[data-item-id]") as HTMLElement
		if (!dropTarget) return
		const contents = await this.item.system.contents
		const target = contents.get(dropTarget.dataset.itemId ?? "")!

		// Don't sort on yourself
		if (item.id === target.id) return

		// Identify sibling items based on adjacent HTML elements
		const siblings = []
		for (const el of dropTarget.parentElement!.children) {
			const siblingId = (el as HTMLElement).dataset.itemId
			if (siblingId && siblingId !== item.id) siblings.push(contents.get(siblingId))
		}

		// Perform the sort
		const sortUpdates = SortingHelpers.performIntegerSort(item, { target, siblings })
		const updateData = sortUpdates.map(u => {
			const update = u.update
			update._id = u.target.id
			return update
		})

		// Perform the update
		Item.updateDocuments(updateData, { pack: this.item.pack, parent: this.item.actor })
	}

	/* -------------------------------------------- */
	/*  Helpers                                     */
	/* -------------------------------------------- */

	/**
	 * Retrieve an item with the specified ID.
	 */
	getItem(id: string): MaybePromise<ItemGURPS2 | null> {
		if (this.item.hasTemplate(ItemTemplateType.Container)) return this.item.system.getContainedItem(id)
		return null
		// return this.document.items.get(id)
	}

	/* -------------------------------------------- */

	protected override _configureRenderOptions(options: ApplicationRenderOptions) {
		super._configureRenderOptions(options)
		if (!this.item.hasTemplate(ItemTemplateType.Replacement))
			options.parts = options.parts?.filter(e => e !== "replacements")
		if (!this.item.hasTemplate(ItemTemplateType.Container))
			options.parts = options.parts?.filter(e => e !== "embeds")
	}

	/* -------------------------------------------- */

	_getTabs(): Record<string, Partial<ApplicationTab>> {
		let tabs: Record<string, Partial<ApplicationTab>> = {
			description: {
				id: "description",
				group: "primary",
				icon: "",
				label: "GURPS.Sheets.Item.Tabs.Description",
			},
			details: {
				id: "details",
				group: "primary",
				icon: "",
				label: "GURPS.Sheets.Item.Tabs.Details",
			},
			embeds: {
				id: "embeds",
				group: "primary",
				icon: "",
				label: "GURPS.Sheets.Item.Tabs.Embeds",
			},
			replacements: {
				id: "replacements",
				group: "primary",
				icon: "",
				label: "GURPS.Sheets.Item.Tabs.Replacements",
			},
		}
		if (!this.item.hasTemplate(ItemTemplateType.Replacement)) delete tabs.replacements
		if (!this.item.hasTemplate(ItemTemplateType.Container)) delete tabs.embeds

		return this._markTabs(tabs)
	}

	/* -------------------------------------------- */

	protected _markTabs(tabs: Record<string, Partial<ApplicationTab>>): Record<string, Partial<ApplicationTab>> {
		for (const v of Object.values(tabs)) {
			v.active = this.tabGroups[v.group!] === v.id
			v.cssClass = v.active ? "active" : ""
			if ("tabs" in v) this._markTabs(v.tabs as Record<string, Partial<ApplicationTab>>)
		}
		return tabs
	}

	/* -------------------------------------------- */

	static async #onViewImage(this: ItemSheetGURPS, event: Event): Promise<void> {
		event.preventDefault()
		const title = this.item.name
		// const title = this.item.system.identified === false ? this.item.system.unidentified.name : this.item.name
		new ImagePopout(this.item.img, { title, uuid: this.item.uuid }).render(true)
	}

	/* -------------------------------------------- */

	static async #onEditImage(this: ItemSheetGURPS, event: Event): Promise<void> {
		const img = event.currentTarget as HTMLImageElement
		let current = this.document.img
		const fp = new FilePicker({
			type: "image",
			current: current,
			callback: async (path: FilePath) => {
				img.src = path
				await this.item.update({ img: path })
				return this.render()
			},
			top: this.position.top! + 40,
			left: this.position.left! + 10,
		})
		await fp.browse(this.item.img)
	}

	/* -------------------------------------------- */

	static async #onAddPrereq(this: ItemSheetGURPS, event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		const element = event.target as HTMLElement
		const index = parseInt(element.dataset.index ?? "")
		if (isNaN(index)) return
		const item = this.item
		if (!item.hasTemplate(ItemTemplateType.Prereq)) return

		const prereqs = item.system.toObject().prereqs
		const newId = generateId()
		;(prereqs[index] as SourceFromSchema<PrereqListSchema>).prereqs.push(newId)
		prereqs.push(new AttributePrereq({ id: newId }).toObject())

		await this.item.update({ "system.prereqs": prereqs })
	}

	/* -------------------------------------------- */

	static async #onAddPrereqList(this: ItemSheetGURPS, event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		const element = event.target as HTMLElement
		const index = parseInt(element.dataset.index ?? "")
		if (isNaN(index)) return
		const item = this.item
		if (!item.hasTemplate(ItemTemplateType.Prereq)) return

		const prereqs = item.system.toObject().prereqs
		const newId = generateId()
		;(prereqs[index] as SourceFromSchema<PrereqListSchema>).prereqs.push(newId)
		prereqs.push(new PrereqList({ id: newId }).toObject())

		await this.item.update({ "system.prereqs": prereqs })
	}

	/* -------------------------------------------- */

	static async #onDeletePrereq(this: ItemSheetGURPS, event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		function addNestedIds(id: string): void {
			const entry = prereqs.find(e => e.id === id)
			if (!entry) return
			idsToDelete.push(entry.id)

			if (entry.isOfType(prereq.Type.List)) {
				for (const childId of entry.prereqs) {
					addNestedIds(childId)
				}
			}
		}

		/* -------------------------------------------- */

		const element = event.target as HTMLElement
		const id = element.dataset.id as string
		const item = this.item
		if (!item.hasTemplate(ItemTemplateType.Prereq)) return

		const idsToDelete = <string[]>[]
		const prereqs = item.system.prereqs
		let prereqObj = item.system.toObject().prereqs
		addNestedIds(id)
		const parentIndex = prereqs.findIndex(e => (e as SourceFromSchema<PrereqListSchema>).prereqs?.includes(id))
		if (parentIndex !== -1)
			(prereqObj[parentIndex] as SourceFromSchema<PrereqListSchema>).prereqs = (
				prereqObj[parentIndex] as SourceFromSchema<PrereqListSchema>
			).prereqs.filter(e => e !== id)
		prereqObj = prereqObj.filter(e => !idsToDelete.includes(e.id))

		await this.item.update({ "system.prereqs": prereqObj })
	}

	/* -------------------------------------------- */

	static async #onAddFeature(this: ItemSheetGURPS, event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		const item = this.item
		if (!item.hasTemplate(ItemTemplateType.Feature)) return

		const features = item.system.toObject().features
		features.push(new AttributeBonus({}).toObject())

		await this.item.update({ "system.features": features })
	}

	/* -------------------------------------------- */

	static async #onDeleteFeature(this: ItemSheetGURPS, event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		const element = event.target as HTMLElement
		const index = parseInt(element.dataset.index ?? "")
		if (isNaN(index)) return
		const item = this.item
		if (!item.hasTemplate(ItemTemplateType.Feature)) return

		const features = item.system.toObject().features
		features.splice(index, 1)

		await this.item.update({ "system.features": features })
	}

	/* -------------------------------------------- */

	static async #onAddDefault(this: ItemSheetGURPS, event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		const item = this.item
		if (!item.hasTemplate(ItemTemplateType.Default)) return

		const defaults = item.system.toObject().defaults
		defaults.push(new SkillDefault({}).toObject())

		await this.item.update({ "system.defaults": defaults })
	}

	static async #onDeleteDefault(this: ItemSheetGURPS, event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		const element = event.target as HTMLElement
		const index = parseInt(element.dataset.index ?? "")
		if (isNaN(index)) return
		const item = this.item
		if (!item.hasTemplate(ItemTemplateType.Default)) return

		const defaults = item.system.toObject().defaults
		defaults.splice(index, 1)

		await this.item.update({ "system.defaults": defaults })
	}

	/* -------------------------------------------- */

	async _onChangePrereqType(event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		const element = event.target as HTMLSelectElement
		const index = parseInt(element.dataset.index ?? "")
		if (isNaN(index)) return
		const value = element.value as prereq.Type
		const item = this.item
		if (!item.hasTemplate(ItemTemplateType.Prereq)) return

		const prereqs = item.system.toObject().prereqs

		const id = prereqs[index].id
		prereqs.splice(index, 1, new PrereqTypes[value]({ id }).toObject())

		this.item.update({ "system.prereqs": prereqs })
	}

	async _onChangeFeatureType(event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		const element = event.target as HTMLSelectElement
		const index = parseInt(element.dataset.index ?? "")
		if (isNaN(index)) return
		const value = element.value as feature.Type
		const item = this.item
		if (!item.hasTemplate(ItemTemplateType.Feature)) return

		const features = item.system.toObject().features

		features.splice(index, 1, new FeatureTypes[value]({ type: value }).toObject())

		this.item.update({ "system.features": features })
	}

	/* -------------------------------------------- */

	static async #onToggleDrBonusLocation(this: ItemSheetGURPS, event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		const element = event.target as HTMLSelectElement
		const index = parseInt(element.dataset.index ?? "")
		if (isNaN(index)) return
		const locationId = element.dataset.location ?? ""

		const item = this.item
		if (!item.hasTemplate(ItemTemplateType.Feature)) return
		const bonus = item.system.toObject().features[index] as SourceFromSchema<DRBonusSchema>
		if (bonus.locations.includes(locationId)) bonus.locations = bonus.locations.filter(e => e !== locationId)
		else bonus.locations.push(locationId)

		await this.item.update({ [`system.features.${index}`]: bonus })
	}

	/* -------------------------------------------- */

	protected override _onRender(context: object, options: ApplicationRenderOptions): void {
		super._onRender(context, options)
		const prereqTypeFields = this.element.querySelectorAll("[data-selector='prereq-type'")
		for (const input of prereqTypeFields) {
			input.addEventListener("change", event => this._onChangePrereqType(event))
		}
		const featureTypeFields = this.element.querySelectorAll("[data-selector='feature-type'")
		for (const input of featureTypeFields) {
			input.addEventListener("change", event => this._onChangeFeatureType(event))
		}
		if (!this.isEditable) this._disableFields()

		this.element.classList.add(this.item.type)
		this.#dragDrop.forEach(d => d.bind(this.element))

		if (options.isFirstRender) {
			new ContextMenuGURPS(this.element, "[data-item-id]", [], {
				onOpen: this._onOpenItemContextMenu.bind(this),
			})
		}
	}

	/* -------------------------------------------- */

	protected _disableFields() {
		const selector = `.window-content :is(${[
			"INPUT",
			"SELECT",
			"TEXTAREA",
			"BUTTON",
			"COLOR-PICKER",
			"DOCUMENT-TAGS",
			"FILE-PICKER",
			"HUE-SLIDER",
			"MULTI-SELECT",
			"PROSE-MIRROR",
			"RANGE-PICKER",
			"STRING-TAGS",
		].join(", ")}):not(.interface-only)`
		for (const element of this.element.querySelectorAll(selector) as NodeListOf<HTMLInputElement>) {
			if (element.tagName === "TEXTAREA") element.readOnly = true
			else element.disabled = true
		}
	}

	override async _prepareContext(options = {}): Promise<object> {
		const context: Record<string, unknown> = {}
		await this.item.system.getSheetData(context)
		const obj = {
			...super._prepareContext(options),
			fields: this.item.system.schema.fields,
			tabs: this._getTabs(),
			item: this.item,
			system: this.item.system,
			source: this.item.system.toObject(),
			detailsParts: context.detailsParts ?? [],
			embedsParts: context.embedsParts ?? [],
			headerFilter: context.headerFilter ?? "",
			editable: this.isEditable && this._mode === this.constructor.MODES.EDIT,
		}
		return obj
	}

	/* -------------------------------------------- */

	protected override async _preparePartContext(partId: string, context: Record<string, any>): Promise<object> {
		context.partId = `${this.id}-${partId}`
		context.tab = context.tabs[partId]

		if (partId === "details") {
			switch (this.item.type) {
				case ItemType.Skill:
				case ItemType.Technique:
					this._prepareSkillPartContext(context)
					break
				case ItemType.Equipment:
				case ItemType.EquipmentContainer:
					this._prepareEquipmentPartContext(context)
					break
				case ItemType.Note:
				case ItemType.NoteContainer:
					this._prepareNoteContext(context)
					break
			}
		}

		if (partId === "embeds") {
			if (!this.item.hasTemplate(ItemTemplateType.Container)) return context
			context.modifiers = await this._prepareEmbedList(this.item.system.modifiers, {
				type: this.item.type as ItemType,
				level: 0,
			})
			context.children = await this._prepareEmbedList(this.item.system.children, {
				type: this.item.type as ItemType,
				level: 0,
			})
			context.weaponsMelee = await this._prepareEmbedList(
				(await this.item.system.itemTypes)[ItemType.WeaponMelee],
				{
					type: this.item.type as ItemType,
					level: 0,
				},
			)
			context.weaponsRanged = await this._prepareEmbedList(
				(await this.item.system.itemTypes)[ItemType.WeaponRanged],
				{
					type: this.item.type as ItemType,
					level: 0,
				},
			)
		}
		return context
	}

	/* -------------------------------------------- */

	protected async _prepareEmbedList(
		embeds: MaybePromise<Collection<ItemGURPS2> | Array<ItemGURPS2>>,
		{ type, level }: { type: ItemType; level: number },
	): Promise<ItemCell[]> {
		const list: ItemCell[] = []
		;(await embeds).forEach(async item => {
			const listItem: ItemCell = {
				name: item.name,
				id: item.id,
				sort: item.sort,
				uuid: item.uuid,
				type: item.type as ItemType,
				cells: item.system.cellData({ type, level }),
				buttons: item.system.sheetButtons,
			}
			if (item.hasTemplate(ItemTemplateType.Container)) {
				listItem.children = await this._prepareEmbedList(item.system.children, { type, level: level + 1 })
			}
			list.push(listItem)
		})
		return list
	}

	/* -------------------------------------------- */

	protected async _prepareSkillPartContext(context: Record<string, any>): Promise<object> {
		if (!this.item.hasTemplate(ItemTemplateType.AbstractSkill)) return context
		if (this.item.system.level.level === Number.MIN_SAFE_INTEGER) context.levelField = "-"
		else context.levelField = `${this.item.system.levelAsString}/${this.item.system.relativeLevel}`
		return context
	}

	/* -------------------------------------------- */

	protected async _prepareEquipmentPartContext(context: Record<string, any>): Promise<object> {
		if (!this.item.hasTemplate(ItemTemplateType.EquipmentFields)) return context
		context.extendedValue = this.item.system.extendedValue
		context.extendedWeight = Weight.format(
			await this.item.system.extendedWeight(false, SheetSettings.for(this.item.actor).default_weight_units),
		)
		return context
	}

	/* -------------------------------------------- */

	protected async _prepareNoteContext(context: Record<string, any>): Promise<object> {
		if (!this.item.hasTemplate(ItemTemplateType.Note)) return context
		context.enrichedText = await this.item.system.enrichedText
		return context
	}

	/* -------------------------------------------- */

	static async #onSubmit(
		this: ItemSheetGURPS,
		event: Event | SubmitEvent,
		_form: HTMLFormElement,
		formData: FormDataExtended,
	): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		for (const key of Object.keys(formData.object)) {
			if (key.endsWith("locations")) {
				const value = formData.object[key] === gid.All ? [gid.All] : []
				formData.object[key] = value
			}
		}

		if (
			this.item.type === ItemType.Trait ||
			this.item.type === ItemType.TraitContainer ||
			this.item.type === ItemType.TraitModifier ||
			this.item.type === ItemType.EquipmentModifier
		) {
			formData.object["system.disabled"] = Boolean(!formData.object["system.enabled"])
			delete formData.object["system.enabled"]
		}

		await this.item.update(formData.object)
	}

	/* -------------------------------------------- */

	static async #onToggleMode(this: ItemSheetGURPS, event: Event): Promise<void> {
		const toggle = event.target as HTMLButtonElement
		toggle.classList.toggle("fa-lock")
		toggle.classList.toggle("fa-unlock")

		const { MODES } = this.constructor
		if (this._mode === MODES.PLAY) this._mode = MODES.EDIT
		else this._mode = MODES.PLAY
		await this.submit()
		this.render()
	}

	/* -------------------------------------------- */

	static async #onToggleCheckbox(this: ItemSheetGURPS, event: Event): Promise<void> {
		const toggle = event.target as HTMLElement
		const itemId = (toggle.closest("li.item") as HTMLElement)?.dataset.itemId ?? null

		if (itemId === null) {
			console.error("#onToggleCheckbox action failed: No itemId found")
			return
		}

		const disabled = !toggle.classList.contains("enabled")
		toggle.classList.toggle("enabled")
		const item = this.item
		if (!item.hasTemplate(ItemTemplateType.Container)) {
			console.error(`#onToggleCheckbox action failed: container is not a valid Container Item.`)
			return
		}

		const childItem = await item.system.getContainedItem(itemId)
		if (!childItem) {
			console.error(`#onToggleCheckbox action failed: no item with ID "${itemId} found."`)
			return
		}

		await childItem.update({ "system.disabled": !disabled })
	}

	/* -------------------------------------------- */

	static async #onToggleDropdown(this: ItemSheetGURPS, event: Event): Promise<void> {
		const toggle = event.target as HTMLElement
		const itemId = (toggle.closest("li.item") as HTMLElement)?.dataset.itemId ?? null

		if (itemId === null) {
			console.error("#onToggleDropdown action failed: No itemId found")
			return
		}

		const open = toggle.classList.contains("fa-caret-down")
		toggle.classList.toggle("enabled")
		const item = this.item
		if (!item.hasTemplate(ItemTemplateType.Container)) {
			console.error(`#onToggleDropdown action failed: container is not a valid Container Item.`)
			return
		}

		const childItem = await item.system.getContainedItem(itemId)
		if (!childItem) {
			console.error(`#onToggleDropdown action failed: no item with ID "${itemId} found."`)
			return
		}

		await childItem.update({ "system.open": !open })
	}

	/* -------------------------------------------- */

	static async #onOpenItemContextMenu(this: ItemSheetGURPS, event: PointerEvent): Promise<void> {
		event.preventDefault()
		event.stopPropagation()
		const { clientX, clientY } = event

		;(event.target as HTMLElement).closest("[data-item-id]")?.dispatchEvent(
			new PointerEvent("contextmenu", {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX,
				clientY,
			}),
		)
	}

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

	/* -------------------------------------------- */

	protected override async _renderFrame(options: ApplicationRenderOptions): Promise<HTMLElement> {
		const frame = await super._renderFrame(options)

		if (this.isEditable) {
			const toggleLabel = game.i18n.localize("GURPS.Sheets.ToggleMode")
			const toggleIcon = this._mode === this.constructor.MODES.PLAY ? "fa-solid fa-lock" : "fa-solid fa-unlock"
			const toggle = `<button type="button" class="header-control ${toggleIcon}" data-action="toggleMode"
data-tooltip="${toggleLabel}" aria-label="${toggleLabel}"></button>`
			this.window.icon.insertAdjacentHTML("beforebegin", toggle)
		}
		return frame
	}
}

interface ItemSheetGURPS {
	constructor: typeof ItemSheetGURPS
	options: DocumentSheetConfiguration & { dragDrop: DragDropConfiguration[] }
}

export { ItemSheetGURPS }
