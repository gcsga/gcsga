import { ItemType, SYSTEM_NAME, gid } from "@module/data/constants.ts"
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

const { api, sheets } = foundry.applications

class ItemSheetGURPS extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2<ItemGURPS2>) {
	static MODES = {
		PLAY: 1,
		EDIT: 2,
	}

	protected _mode = this.constructor.MODES.PLAY

	// Set initial values for tabgroups
	override tabGroups: Record<string, string> = {
		primary: "details",
	}

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
		},
		dragDrop: [{ dragSelector: "item-list .item", dropSelector: null }],
	}

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

	// constructor(options: DocumentSheetConfiguration) {
	// 	super(options)
	// 	this.options.window.contentClasses ??= []
	// 	this.options.window.contentClasses.push(this.item.type)
	// }

	protected override _configureRenderOptions(options: ApplicationRenderOptions) {
		super._configureRenderOptions(options)
		if (!this.item.hasTemplate(ItemTemplateType.Replacement))
			options.parts = options.parts?.filter(e => e !== "replacements")
		if (!this.item.hasTemplate(ItemTemplateType.Container))
			options.parts = options.parts?.filter(e => e !== "embeds")
	}

	_getTabs(): Record<string, Partial<ApplicationTab>> {
		return this._markTabs({
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
		})
	}

	protected _markTabs(tabs: Record<string, Partial<ApplicationTab>>): Record<string, Partial<ApplicationTab>> {
		for (const v of Object.values(tabs)) {
			v.active = this.tabGroups[v.group!] === v.id
			v.cssClass = v.active ? "active" : ""
			if ("tabs" in v) this._markTabs(v.tabs as Record<string, Partial<ApplicationTab>>)
		}
		return tabs
	}

	static async #onViewImage(this: ItemSheetGURPS, event: Event): Promise<void> {
		event.preventDefault()
		const title = this.item.name
		// const title = this.item.system.identified === false ? this.item.system.unidentified.name : this.item.name
		new ImagePopout(this.item.img, { title, uuid: this.item.uuid }).render(true)
	}

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

	static async #onAddPrereq(this: ItemSheetGURPS, event: Event): Promise<void> {
		console.log("#onAddPrereq")
		console.trace()
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

	static async #onAddFeature(this: ItemSheetGURPS, event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		const item = this.item
		if (!item.hasTemplate(ItemTemplateType.Feature)) return

		const features = item.system.toObject().features
		features.push(new AttributeBonus({}).toObject())

		await this.item.update({ "system.features": features })
	}

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
	}

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

	protected override async _preparePartContext(partId: string, context: Record<string, any>): Promise<object> {
		context.partId = `${this.id}-${partId}`
		context.tab = context.tabs[partId]

		if (partId === "details") {
			switch (this.item.type) {
				case ItemType.Skill:
				case ItemType.Technique:
					this._prepareSkillPartContext(context)
					break
				case ItemType.Note:
				case ItemType.NoteContainer:
					this._prepareNoteContext(context)
					break
			}
		}
		return context
	}

	protected async _prepareSkillPartContext(context: Record<string, any>): Promise<object> {
		if (!this.item.hasTemplate(ItemTemplateType.AbstractSkill)) return context
		if (this.item.system.level.level === Number.MIN_SAFE_INTEGER) context.levelField = "-"
		else context.levelField = `${this.item.system.levelAsString}/${this.item.system.relativeLevel}`
		return context
	}

	protected async _prepareNoteContext(context: Record<string, any>): Promise<object> {
		if (!this.item.hasTemplate(ItemTemplateType.Note)) return context
		context.enrichedText = await this.item.system.enrichedText
		return context
	}

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

		if (this.item.type === ItemType.Trait || this.item.type === ItemType.TraitContainer) {
			formData.object["system.disabled"] = Boolean(!formData.object["system.enabled"])
			delete formData.object["system.enabled"]
		}

		await this.item.update(formData.object)
	}

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
}

export { ItemSheetGURPS }
