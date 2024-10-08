import { ActiveEffectGURPS } from "@module/document/active-effect.ts"
import api = foundry.applications.api
import { EffectType, SYSTEM_NAME } from "@module/data/constants.ts"
import { AttributeBonus } from "@module/data/feature/attribute-bonus.ts"
import { RollModifier } from "@module/data/roll-modifier.ts"

class ActiveEffectSheetGURPS extends api.HandlebarsApplicationMixin(api.DocumentSheetV2<ActiveEffectGURPS>) {
	// Set initial values for tabgroups
	override tabGroups: Record<string, string> = {
		primary: "details",
	}

	static override DEFAULT_OPTIONS: Partial<DocumentSheetConfiguration> = {
		tag: "form",
		classes: ["gurps", "active-effect"],
		window: {
			contentClasses: [""],
			icon: "gcs-effect",
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
			addFeature: this.#onAddFeature,
			deleteFeature: this.#onDeleteFeature,
			addRollModifier: this.#onAddRollModifier,
			deleteRollModifier: this.#onDeleteRollModifier,
			addEffectChange: this.#onAddEffectChange,
			deleteEffectChange: this.#onDeleteEffectChange,
		},
	}

	static override PARTS = {
		header: {
			id: "header",
			template: `systems/${SYSTEM_NAME}/templates/active-effects/parts/effect-header.hbs`,
			scrollable: [""],
		},
		details: {
			id: "details",
			template: `systems/${SYSTEM_NAME}/templates/active-effects/tabs/effect-details.hbs`,
			scrollable: [""],
		},
		duration: {
			id: "duration",
			template: `systems/${SYSTEM_NAME}/templates/active-effects/tabs/effect-duration.hbs`,
			scrollable: [""],
		},
		effects: {
			id: "effects",
			template: `systems/${SYSTEM_NAME}/templates/active-effects/tabs/effect-effects.hbs`,
			scrollable: [""],
		},
	}

	get effect(): ActiveEffectGURPS {
		return this.document
	}

	override async _prepareContext(options = {}): Promise<object> {
		const descriptionHTML = await TextEditor.enrichHTML(this.effect.description, { secrets: this.effect.isOwner })

		const obj = {
			...super._prepareContext(options),
			descriptionHTML,
			fields: this.effect.system.schema.fields,
			tabs: this._getTabs(),
			effect: this.effect,
			data: this.effect.toObject(),
			system: this.effect.system,
			source: this.effect.system.toObject(),
			editable: this.isEditable,
			modes: Object.entries(CONST.ACTIVE_EFFECT_MODES).reduce((obj, e) => {
				// @ts-expect-error unknown type
				obj[e[1]] = game.i18n.localize(`EFFECT.MODE_${e[0]}`)
				return obj
			}, {}),
		}
		console.log(obj)
		return obj
	}

	protected override async _preparePartContext(partId: string, context: Record<string, any>): Promise<object> {
		context.partId = `${this.id}-${partId}`
		context.tab = context.tabs[partId]
		return context
	}

	_getTabs(): Record<string, Partial<ApplicationTab>> {
		return this._markTabs({
			details: {
				id: "details",
				group: "primary",
				icon: "",
				label: "GURPS.Sheets.Effect.Tabs.Details",
			},
			duration: {
				id: "duration",
				group: "primary",
				icon: "",
				label: "GURPS.Sheets.Effect.Tabs.Duration",
			},
			effects: {
				id: "effects",
				group: "primary",
				icon: "",
				label: "GURPS.Sheets.Effect.Tabs.Effects",
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

	static async #onViewImage(this: ActiveEffectSheetGURPS, event: Event): Promise<void> {
		event.preventDefault()
		const title = this.effect.name
		// const title = this.effect.system.identified === false ? this.effect.system.unidentified.name : this.effect.name
		new ImagePopout(this.effect.img, { title, uuid: this.effect.uuid }).render(true)
	}

	static async #onEditImage(this: ActiveEffectSheetGURPS, event: Event): Promise<void> {
		const img = event.currentTarget as HTMLImageElement
		let current = this.document.img
		const fp = new FilePicker({
			type: "image",
			current: current,
			callback: async (path: FilePath) => {
				img.src = path
				await this.effect.update({ img: path })
				return this.render()
			},
			top: this.position.top! + 40,
			left: this.position.left! + 10,
		})
		await fp.browse(this.effect.img)
	}

	static async #onAddFeature(this: ActiveEffectSheetGURPS, event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		const effect = this.effect
		if (!effect.isOfType(EffectType.Effect, EffectType.Condition)) return

		const features = (effect.system.toObject() as any).features
		features.push(new AttributeBonus({}).toObject())

		await this.effect.update({ "system.features": features })
	}

	static async #onDeleteFeature(this: ActiveEffectSheetGURPS, event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		const element = event.target as HTMLElement
		const index = parseInt(element.dataset.index ?? "")
		if (isNaN(index)) return
		const effect = this.effect
		if (!effect.isOfType(EffectType.Effect, EffectType.Condition)) return

		const features = (effect.system.toObject() as any).features
		features.splice(index, 1)

		await this.effect.update({ "system.features": features })
	}

	static async #onAddRollModifier(this: ActiveEffectSheetGURPS, event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		const effect = this.effect
		if (!effect.isOfType(EffectType.Effect, EffectType.Condition)) return

		const modifiers = (effect.system.toObject() as any).modifiers
		modifiers.push(new RollModifier().toObject())

		await this.effect.update({ "system.modifiers": modifiers })
	}

	static async #onDeleteRollModifier(this: ActiveEffectSheetGURPS, event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		const element = event.target as HTMLElement
		const index = parseInt(element.dataset.index ?? "")
		if (isNaN(index)) return
		const effect = this.effect
		if (!effect.isOfType(EffectType.Effect, EffectType.Condition)) return

		const modifiers = (effect.system.toObject() as any).modifiers
		modifiers.splice(index, 1)

		await this.effect.update({ "system.modifiers": modifiers })
	}

	static async #onAddEffectChange(this: ActiveEffectSheetGURPS, event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()
		const effect = this.effect

		const changes = effect.toObject().changes
		// @ts-expect-error priority key missing, is ok
		changes.push({ key: "", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "" })

		await this.effect.update({ changes: changes }, { render: true })
	}

	static async #onDeleteEffectChange(this: ActiveEffectSheetGURPS, event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		const element = event.target as HTMLElement
		const index = parseInt(element.dataset.index ?? "")
		if (isNaN(index)) return
		const effect = this.effect

		const changes = effect.toObject().changes
		changes.splice(index, 1)

		await this.effect.update({ changes: changes })
	}

	static async #onSubmit(
		this: ActiveEffectSheetGURPS,
		event: Event | SubmitEvent,
		_form: HTMLFormElement,
		formData: FormDataExtended,
	): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		await this.effect.update(formData.object)
	}
}

interface ActiveEffectSheetGURPS {
	constructor: typeof ActiveEffectSheetGURPS
}
export { ActiveEffectSheetGURPS }
