import { SYSTEM_NAME, gid } from "@module/data/constants.ts"
import { AttributeBonus } from "@module/data/feature/attribute-bonus.ts"
import { DRBonusSchema } from "@module/data/feature/dr-bonus.ts"
import { FeatureTypes } from "@module/data/feature/types.ts"
import { ItemTemplateType } from "@module/data/item/types.ts"
import { AttributePrereq } from "@module/data/prereq/index.ts"
import { PrereqList, PrereqListSchema } from "@module/data/prereq/prereq-list.ts"
import { PrereqTypes } from "@module/data/prereq/types.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { feature, prereq } from "@util/enum/index.ts"
import { generateId } from "@util/misc.ts"

const { api, sheets } = foundry.applications

class ItemSheetGURPS extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2<ItemGURPS2>) {
	// Set initial values for tabgroups
	override tabGroups: Record<string, string> = {
		primary: "description",
	}

	static override DEFAULT_OPTIONS: Partial<DocumentSheetConfiguration> & { dragDrop: DragDropConfiguration[] } = {
		tag: "form",
		classes: ["gurps", "item"],
		window: {
			contentClasses: [""],
			icon: "gcs-character",
			title: "",
			controls: [],
			resizable: true,
		},
		position: {
			width: 650,
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
		},
		dragDrop: [{ dragSelector: "item-list .item", dropSelector: null }],
	}

	static override PARTS = {
		header: {
			id: "header",
			template: `systems/${SYSTEM_NAME}/templates/items/parts/item-header.hbs`,
			scrollable: [""],
		},
		descriptionTab: {
			id: "description",
			template: `systems/${SYSTEM_NAME}/templates/items/tabs/item-description.hbs`,
			scrollable: [""],
		},
		detailsTab: {
			id: "details",
			template: `systems/${SYSTEM_NAME}/templates/items/tabs/item-details.hbs`,
			scrollable: [""],
		},
		embedsTab: {
			id: "embeds",
			template: `systems/${SYSTEM_NAME}/templates/items/tabs/item-embeds.hbs`,
			scrollable: [""],
		},
	}

	_getTabs(): Record<string, Partial<ApplicationTab>> {
		return this._markTabs({
			descriptionTab: {
				id: "description",
				group: "primary",
				icon: "",
				label: "DESCRIPTION",
			},
			detailsTab: {
				id: "details",
				group: "primary",
				icon: "",
				label: "DETAILS",
			},
			embedsTab: {
				id: "embeds",
				group: "primary",
				icon: "",
				label: "EMBEDS",
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

		features.splice(index, 1, new FeatureTypes[value]().toObject())

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

	protected override _onRender(_context: object, _options: ApplicationRenderOptions): void {
		const prereqTypeFields = this.element.querySelectorAll("[data-selector='prereq-type'")
		for (const input of prereqTypeFields) {
			input.addEventListener("change", event => this._onChangePrereqType(event))
		}
		const featureTypeFields = this.element.querySelectorAll("[data-selector='feature-type'")
		for (const input of featureTypeFields) {
			input.addEventListener("change", event => this._onChangeFeatureType(event))
		}
	}

	override async _prepareContext(options = {}): Promise<object> {
		const context: Record<string, unknown> = {}
		await this.item.system.getSheetData(context)
		return {
			...super._prepareContext(options),
			fields: this.item.system.schema.fields,
			tabs: this._getTabs(),
			item: this.item,
			system: this.item.system,
			source: this.item.system.toObject(),
			detailsParts: context.detailsParts ?? [],
			embedsParts: context.embedsParts ?? [],
		}
	}

	protected override async _preparePartContext(partId: string, context: Record<string, any>): Promise<object> {
		context.partId = `${this.id}-${partId}`
		context.tab = context.tabs[partId]
		return context
	}

	static async #onSubmit(
		this: ItemSheetGURPS,
		event: Event | SubmitEvent,
		_form: HTMLFormElement,
		formData: FormDataExtended,
	): Promise<void> {
		event.preventDefault()

		for (const key of Object.keys(formData.object)) {
			if (key.endsWith("locations")) {
				const value = formData.object[key] === gid.All ? [gid.All] : []
				formData.object[key] = value
			}
		}

		console.log(formData.object)

		await this.item.update(formData.object)
	}
}

interface ItemSheetGURPS {
	constructor: typeof ItemSheetGURPS
}

export { ItemSheetGURPS }
