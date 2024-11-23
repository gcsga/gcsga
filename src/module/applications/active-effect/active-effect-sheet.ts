import { ActiveEffectGURPS } from "@module/documents/active-effect.ts"
import api = foundry.applications.api
import { EffectType, SYSTEM_NAME } from "@module/data/constants.ts"
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
			width: 600,
			height: 400,
		},
		form: {
			submitOnChange: true,
			closeOnSubmit: false,
			handler: this.#onSubmit,
		},
		actions: {
			viewImage: this.#onViewImage,
			editImage: this.#onEditImage,
			// addFeature: this.#onAddFeature,
			// deleteFeature: this.#onDeleteFeature,
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

	/* -------------------------------------------- */

	get editable(): boolean {
		return this.isEditable
	}

	override async _prepareContext(options = {}): Promise<object> {
		const modes = Object.fromEntries(
			Object.entries(CONST.ACTIVE_EFFECT_MODES).map(e => [e[1], game.i18n.localize(`EFFECT.MODE_${e[0]}`)]),
		)
		const context: Record<string, unknown> = {
			...super._prepareContext(options),
			fields: this.effect.system.schema.fields,
			tabs: this._getTabs(),
			effect: this.effect,
			data: this.effect.toObject(),
			system: this.effect.system,
			source: this.effect.system.toObject(),
			editable: this.editable,
			modes,
		}

		context.enrichedDescription = await TextEditor.enrichHTML(this.effect.description, {
			secrets: this.effect.isOwner,
			async: true,
		})

		return context
	}

	/* -------------------------------------------- */

	protected override async _preparePartContext(partId: string, context: Record<string, any>): Promise<object> {
		context.partId = `${this.id}-${partId}`
		context.tab = context.tabs[partId]
		return context
	}

	/* -------------------------------------------- */

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

	static async #onViewImage(this: ActiveEffectSheetGURPS, event: Event): Promise<void> {
		event.preventDefault()
		const title = this.effect.name
		// const title = this.effect.system.identified === false ? this.effect.system.unidentified.name : this.effect.name
		new ImagePopout(this.effect.img, { title, uuid: this.effect.uuid }).render(true)
	}

	/* -------------------------------------------- */

	static async #onEditImage(this: ActiveEffectSheetGURPS, event: Event): Promise<void> {
		const img = event.currentTarget as HTMLImageElement
		const current = this.document.img
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

	/* -------------------------------------------- */

	// static async #onAddFeature(this: ActiveEffectSheetGURPS, event: Event): Promise<void> {
	// 	event.preventDefault()
	// 	event.stopImmediatePropagation()
	//
	// 	const effect = this.effect
	// 	if (!effect.isOfType(EffectType.Effect, EffectType.Condition)) return
	//
	// 	const features = (effect.system.toObject() as any).features
	// 	features.push(new AttributeBonus({}).toObject())
	//
	// 	await this.effect.update({ "system.features": features })
	// }
	//
	// /* -------------------------------------------- */
	//
	// static async #onDeleteFeature(this: ActiveEffectSheetGURPS, event: Event): Promise<void> {
	// 	event.preventDefault()
	// 	event.stopImmediatePropagation()
	//
	// 	const element = event.target as HTMLElement
	// 	const index = parseInt(element.dataset.index ?? "")
	// 	if (isNaN(index)) return
	// 	const effect = this.effect
	// 	if (!effect.isOfType(EffectType.Effect, EffectType.Condition)) return
	//
	// 	const features = (effect.system.toObject() as any).features
	// 	features.splice(index, 1)
	//
	// 	await this.effect.update({ "system.features": features })
	// }
	//
	/* -------------------------------------------- */

	static async #onAddRollModifier(this: ActiveEffectSheetGURPS, event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		const effect = this.effect
		if (!effect.isOfType(EffectType.Effect, EffectType.Condition)) return

		const modifiers = (effect.system.toObject() as any).modifiers
		modifiers.push(new RollModifier().toObject())

		await this.effect.update({ "system.modifiers": modifiers })
	}

	/* -------------------------------------------- */

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

	/* -------------------------------------------- */

	static async #onAddEffectChange(this: ActiveEffectSheetGURPS, event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()
		const effect = this.effect

		const changes = effect.toObject().changes
		changes.push({ key: "", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "", priority: 0 })

		await this.effect.update({ changes: changes }, { render: true })
	}

	/* -------------------------------------------- */

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

	/* -------------------------------------------- */

	// async _onChangeFeatureType(event: Event): Promise<void> {
	// 	event.preventDefault()
	// 	event.stopImmediatePropagation()
	//
	// 	const element = event.target as HTMLSelectElement
	// 	const index = parseInt(element.dataset.index ?? "")
	// 	if (isNaN(index)) return
	// 	const value = element.value as feature.Type
	// 	const effect = this.effect
	// 	if (!effect.isOfType(EffectType.Effect)) return
	//
	// 	const features = effect.system.toObject().features
	//
	// 	features.splice(index, 1, new FeatureTypes[value]({ type: value }).toObject())
	//
	// 	this.effect.update({ "system.features": features })
	// }

	/* -------------------------------------------- */

	protected override _onRender(context: object, options: ApplicationRenderOptions): void {
		super._onRender(context, options)
		// if (options.isFirstRender) {
		// 	const featureTypeFields = this.element.querySelectorAll("[data-selector='feature-type'")
		// 	for (const input of featureTypeFields) {
		// 		input.addEventListener("change", event => this._onChangeFeatureType(event))
		// 	}
		// }
		if (!this.isEditable) this._disableFields()

		this.element.classList.add(this.effect.type)
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

	/* -------------------------------------------- */

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
