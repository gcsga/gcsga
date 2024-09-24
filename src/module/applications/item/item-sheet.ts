import { SYSTEM_NAME } from "@module/data/constants.ts"
import { ItemGURPS2 } from "@module/document/item.ts"

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
			width: 500,
			height: "auto",
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
		dragDrop: [{ dragSelector: "item-list .item", dropSelector: null }],
	}

	static override PARTS = {
		header: {
			id: "header",
			template: `systems/${SYSTEM_NAME}/templates/items/parts/item-header.hbs`,
		},
		descriptionTab: {
			id: "description",
			template: `systems/${SYSTEM_NAME}/templates/items/tabs/item-description.hbs`,
		},
		detailsTab: {
			id: "details",
			template: `systems/${SYSTEM_NAME}/templates/items/tabs/item-details.hbs`,
		},
		embedsTab: {
			id: "embeds",
			template: `systems/${SYSTEM_NAME}/templates/items/tabs/item-embeds.hbs`,
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

		console.log(formData.object)

		await this.item.update(formData.object)
	}
}

export { ItemSheetGURPS }
