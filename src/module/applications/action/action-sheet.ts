import { Action } from "@module/data/action/types.ts"
import { HOOKS, SYSTEM_NAME } from "@module/data/constants.ts"
import { ItemTemplateInst } from "@module/data/item/helpers.ts"
import { ItemTemplateType } from "@module/data/item/types.ts"
import { ActiveEffectGURPS } from "@module/documents/active-effect.ts"

const { api } = foundry.applications

interface ActionSheetConfiguration extends ApplicationConfiguration {
	document: Action
}

class ActionSheetGURPS extends api.HandlebarsApplicationMixin(api.ApplicationV2) {
	constructor(options: ActionSheetConfiguration) {
		super(options)
		this.#item = options.document.item as any
		this.#actionId = options.document.id
		this.#dragDrop = this.#createDragDropHandlers()
		this._mode = this.item.isOwned ? this.constructor.MODES.PLAY : this.constructor.MODES.EDIT
	}

	/* -------------------------------------------- */

	#dragDrop: DragDrop[]

	/* -------------------------------------------- */

	get dragDrop(): DragDrop[] {
		return this.#dragDrop
	}

	/* -------------------------------------------- */

	#actionId: string
	get action(): Action {
		return this.item.system.actions.get(this.#actionId)!
	}

	/* -------------------------------------------- */

	#item: ItemTemplateInst<ItemTemplateType.Action>
	get item(): ItemTemplateInst<ItemTemplateType.Action> {
		return this.#item
	}

	/* -------------------------------------------- */

	get isEditable(): boolean {
		return this.action.item.isOwner
	}

	/* -------------------------------------------- */

	get editable(): boolean {
		return this.isEditable && this._mode === this.constructor.MODES.EDIT
	}

	/* -------------------------------------------- */

	static MODES = {
		PLAY: 1,
		EDIT: 2,
	}

	/* -------------------------------------------- */

	protected _mode: number

	/* -------------------------------------------- */

	// Set initial values for tabgroups
	override tabGroups: Record<string, string> = {
		primary: "details",
	}

	/* -------------------------------------------- */

	static override DEFAULT_OPTIONS: Partial<DocumentSheetConfiguration> & { dragDrop: DragDropConfiguration[] } = {
		tag: "form",
		classes: ["gurps", "action", "sheet"],
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
		},
		form: {
			submitOnChange: true,
			closeOnSubmit: false,
			handler: this.#onSubmit,
		},
		actions: {
			viewImage: this.#onViewImage,
			editImage: this.#onEditImage,
		},
		dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
	}

	/* -------------------------------------------- */

	static override PARTS = {
		header: {
			id: "header",
			template: `systems/${SYSTEM_NAME}/templates/actions/parts/action-header.hbs`,
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
		// event.preventDefault()
		event.stopImmediatePropagation()

		const li = event.currentTarget as HTMLElement
		if ((event.target as HTMLElement).classList.contains("content-link")) return

		let dragData

		// Active Effect
		if (li.dataset.effectId) {
			const effect = this.item.effects.get(li.dataset.effectId) as ActiveEffectGURPS
			dragData = effect?.toDragData()
		}
		if (!dragData) return

		// Set data transfer
		event.dataTransfer?.setData("text/plain", JSON.stringify(dragData))
	}

	/* -------------------------------------------- */

	async _onDragOver(event: DragEvent): Promise<void> {
		const element = event.target as HTMLElement
		const li = element.closest("li.item")
		if (li) return this._onDragOverItem(event, li as HTMLElement)
		return
	}

	/* -------------------------------------------- */

	async _onDragOverItem(event: DragEvent, li: HTMLElement): Promise<void> {
		;(event.currentTarget as HTMLElement).querySelectorAll("li.item").forEach(el => {
			if (el === li) return
			;(el as HTMLElement).classList.remove("above", "below", "inside")
		})
		const rect = li.getBoundingClientRect()
		if (li.hasAttribute("data-is-container") && event.x > rect.x + rect.width / 5) {
			li.classList.remove("above", "below")
			li.classList.add("inside")
		} else if (event.y > rect.y + rect.height / 2) {
			li.classList.remove("above", "inside")
			li.classList.add("below")
		} else {
			li.classList.remove("below", "inside")
			li.classList.add("above")
		}
	}

	/* -------------------------------------------- */

	protected async _onDrop(event: DragEvent) {
		const data = TextEditor.getDragEventData(event)
		const item = this.item

		const allowed = Hooks.call(`${SYSTEM_NAME}.${HOOKS.DROP_ITEM_SHEET_DATA}`, item, this, data)
		if (allowed === false) return

		switch (data.type) {
			case "ActiveEffect":
				return this._onDropActiveEffect(event, data)
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

	protected override _configureRenderOptions(options: ApplicationRenderOptions) {
		super._configureRenderOptions(options)
	}

	/* -------------------------------------------- */

	_getTabs(): Record<string, Partial<ApplicationTab>> {
		const tabs: Record<string, Partial<ApplicationTab>> = {
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
		}
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

	static async #onViewImage(this: ActionSheetGURPS, event: Event): Promise<void> {
		event.preventDefault()
		const title = this.action.name
		new ImagePopout(this.action.img, { title, uuid: this.action.uuid as DocumentUUID }).render(true)
	}

	/* -------------------------------------------- */

	static async #onEditImage(this: ActionSheetGURPS, event: Event): Promise<void> {
		const img = event.currentTarget as HTMLImageElement
		const current = this.action.img
		const fp = new FilePicker({
			type: "image",
			current: current,
			callback: async (path: FilePath) => {
				img.src = path
				await this.action.update({ img: path })
				return this.render()
			},
			top: this.position.top! + 40,
			left: this.position.left! + 10,
		})
		await fp.browse(this.action.img)
	}

	/* -------------------------------------------- */

	protected override _onRender(context: object, options: ApplicationRenderOptions): void {
		super._onRender(context, options)
		if (!this.isEditable) this._disableFields()

		this.element.classList.add(this.action.type)
		this.#dragDrop.forEach(d => d.bind(this.element))
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
		await this.action.getSheetData(context)
		const obj: Record<string, unknown> = {
			...super._prepareContext(options),
			fields: this.action.schema.fields,
			tabs: this._getTabs(),
			item: this.item,
			action: this.action,
			source: this.action.toObject(),
			detailsParts: context.detailsParts ?? [],
			embedsParts: context.embedsParts ?? [],
			headerFilter: context.headerFilter ?? "",
			editable: this.editable,
		}
		return obj
	}

	/* -------------------------------------------- */

	protected override async _preparePartContext(partId: string, context: Record<string, any>): Promise<object> {
		context.partId = `${this.id}-${partId}`
		context.tab = context.tabs[partId]
		return context
	}

	/* -------------------------------------------- */

	static async #onSubmit(
		this: ActionSheetGURPS,
		event: Event | SubmitEvent,
		_form: HTMLFormElement,
		formData: FormDataExtended,
	): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()
		await this.action.update(formData.object)
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

interface ActionSheetGURPS {
	constructor: typeof ActionSheetGURPS
	options: DocumentSheetConfiguration & { dragDrop: DragDropConfiguration[] }
}

export { ActionSheetGURPS }
