import { SETTINGS, SYSTEM_NAME } from "@module/data/constants.ts"
import fields = foundry.data.fields
import api = foundry.applications.api
import { AttributeDef, AttributeDefSchema } from "@module/data/attribute/attribute-definition.ts"
import { DEFAULT_ATTRIBUTE_SETTINGS } from "./defaults/data.ts"
import { threshold } from "@util"
import { PoolThreshold } from "@module/data/attribute/pool-threshold.ts"

class AttributeSettings extends foundry.abstract.DataModel<null, AttributeSettingsSchema> {
	static override defineSchema(): AttributeSettingsSchema {
		const fields = foundry.data.fields
		return {
			attributes: new fields.ArrayField(new fields.EmbeddedDataField(AttributeDef), {
				initial: DEFAULT_ATTRIBUTE_SETTINGS,
			}),
		}
	}
}

interface AttributeSettings extends ModelPropsFromSchema<AttributeSettingsSchema> {}

type AttributeSettingsSchema = {
	attributes: fields.ArrayField<
		fields.EmbeddedDataField<AttributeDef>,
		Partial<SourceFromSchema<AttributeDefSchema>>[]
	>
}

class AttributesConfig extends api.HandlebarsApplicationMixin(api.ApplicationV2) {
	// Cached settings used for retaining progress without submitting changes
	private declare _cachedSettings: AttributeSettings

	static override DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> & { dragDrop: DragDropConfiguration[] } = {
		id: "attributes-config",
		tag: "form",
		window: {
			contentClasses: ["standard-form"],
			icon: "fa-solid fa-palette",
			title: "GURPS.Settings.AttributesConfig.Title",
		},
		position: {
			width: 660,
			height: "auto",
		},
		form: {
			submitOnChange: false,
			closeOnSubmit: false,
			handler: AttributesConfig.#onSubmit,
		},
		actions: {
			reset: AttributesConfig.#onReset,
			moveItemUp: this.#onMoveItemUp,
			moveItemDown: this.#onMoveItemDown,
			deleteItem: this.#onDeleteItem,
			addItem: this.#onAddItem,
		},
		dragDrop: [{ dragSelector: "[data-drag]", dropSelector: "" }],
	}

	static override PARTS = {
		attributes: {
			id: "attributes",
			template: `systems/${SYSTEM_NAME}/templates/apps/attributes-config.hbs`,
			scrollable: [".attributes-list", ".thresholds-list"],
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		},
	}

	static registerSettings(): void {
		game.settings.register(SYSTEM_NAME, SETTINGS.DEFAULT_ATTRIBUTES, {
			name: "",
			scope: "world",
			type: AttributeSettings,
			default: new AttributeSettings(),
		})
	}

	// Cached settings used for retaining progress without submitting changes
	get cachedSettings(): AttributeSettings {
		return (this._cachedSettings ??= game.settings.get(SYSTEM_NAME, SETTINGS.DEFAULT_ATTRIBUTES))
	}

	set cachedSettings(value: unknown) {
		this._cachedSettings = new AttributeSettings(value as Partial<SourceFromSchema<AttributeSettingsSchema>>)
	}

	override async _prepareContext(_options = {}) {
		const source = this.cachedSettings
		const data = this.#prepareAttributes(source as AttributeSettings)
		return {
			attributes: data.attributes,
			ops: threshold.OpsChoices,
			source: source,
			buttons: [
				{
					type: "reset",
					action: "reset",
					icon: "fa-solid fa-sync",
					label: "GURPS.Settings.AttributesConfig.Reset",
				},
				{ type: "submit", icon: "fa-solid fa-save", label: "GURPS.Settings.AttributesConfig.Submit" },
			],
		}
	}

	override _onRender(_context: object, _options: ApplicationRenderOptions): void {
		const attributeTypeFields = this.element.querySelectorAll(`select[name$=".type"`)
		for (const field of attributeTypeFields) {
			field.addEventListener("change", async e => {
				e.preventDefault()
				e.stopImmediatePropagation()

				const formData = new FormDataExtended(this.element)
				const data = fu.expandObject(formData.object)
				this.cachedSettings = data
				await this.render()
			})
		}
	}

	#prepareAttributes(current: AttributeSettings): AttributeSettings {
		return current
	}

	static async #onSubmit(
		this: AttributesConfig,
		event: Event | SubmitEvent,
		_form: HTMLFormElement,
		formData: FormDataExtended,
	): Promise<void> {
		event.preventDefault()

		// Grab all fields pertaining to threshold ops
		const thresholdCheckboxData = Object.fromEntries(
			Object.entries(formData.object).filter(([key]) =>
				(threshold.Ops as string[]).includes(key.split(".").at(-1) ?? ""),
			),
		)

		// Transform all fields pertaining to threshold ops to fields of value type Array<threshold.Op>
		// and delete original fields
		const thresholdArrayData: Record<string, threshold.Op[]> = {}
		for (const [key, value] of Object.entries(thresholdCheckboxData) as [string, boolean][]) {
			let keyArray = key.split(".")
			const opValue = keyArray.pop() as threshold.Op
			const keyArrayString = keyArray.join(".")

			thresholdArrayData[keyArrayString] ??= []
			if (value) thresholdArrayData[keyArrayString].push(opValue)

			delete formData.object[key]
		}

		const data = fu.expandObject({ ...formData.object, ...thresholdArrayData })
		this.cachedSettings = data
		await game.settings.set(SYSTEM_NAME, SETTINGS.DEFAULT_ATTRIBUTES, data)
		await this.render()
		ui.notifications.info("GURPS.Settings.AttributesConfig.MessageSubmit", { localize: true })
	}

	static async #onReset(this: AttributesConfig, event: Event): Promise<void> {
		event.preventDefault()

		const defaults = game.settings.settings.get(`${SYSTEM_NAME}.${SETTINGS.DEFAULT_ATTRIBUTES}`).default
		this.cachedSettings = defaults
		await game.settings.set(SYSTEM_NAME, SETTINGS.DEFAULT_ATTRIBUTES, defaults)
		ui.notifications.info("GURPS.Settings.AttributesConfig.MessageReset", { localize: true })
		await this.render()
	}

	static async #onMoveItemUp(this: AttributesConfig, event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		const source = this.cachedSettings.toObject()
		const el = event.target as HTMLElement
		const type = el.dataset.itemType

		switch (type) {
			case "attribute": {
				const index = parseInt(el.dataset.itemIndex ?? "")
				if (isNaN(index)) return
				const [attribute] = source.attributes.splice(index, 1)
				if (!attribute) return
				source.attributes.splice(index - 1, 0, attribute)
				break
			}
			case "threshold": {
				const index = parseInt(el.dataset.itemIndex ?? "")
				const parentIndex = parseInt(el.dataset.parentIndex ?? "")
				if (isNaN(index) || isNaN(parentIndex)) return
				const thresholds = source.attributes[parentIndex].thresholds
				if (!thresholds) return
				const [threshold] = thresholds.splice(index, 1)
				if (!threshold) return
				thresholds.splice(index - 1, 0, threshold)
				source.attributes[parentIndex].thresholds = thresholds
			}
		}

		this.cachedSettings = source
		await this.render()
	}
	static async #onMoveItemDown(this: AttributesConfig, event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		const source = this.cachedSettings.toObject()
		const el = event.target as HTMLElement
		const type = el.dataset.itemType

		switch (type) {
			case "attribute": {
				const index = parseInt(el.dataset.itemIndex ?? "")
				if (isNaN(index)) return
				const [attribute] = source.attributes.splice(index, 1)
				if (!attribute) return
				source.attributes.splice(index + 1, 0, attribute)
				break
			}
			case "threshold": {
				const index = parseInt(el.dataset.itemIndex ?? "")
				const parentIndex = parseInt(el.dataset.parentIndex ?? "")
				if (isNaN(index) || isNaN(parentIndex)) return
				const thresholds = source.attributes[parentIndex].thresholds
				if (!thresholds) return
				const [threshold] = thresholds.splice(index, 1)
				if (!threshold) return
				thresholds.splice(index + 1, 0, threshold)
				source.attributes[parentIndex].thresholds = thresholds
			}
		}

		this.cachedSettings = source
		await this.render()
	}

	static async #onAddItem(this: AttributesConfig, event: Event): Promise<void> {
		event.preventDefault()

		const source = this.cachedSettings.toObject()
		const el = event.target as HTMLElement
		const type = el.dataset.itemType

		switch (type) {
			case "attribute": {
				source.attributes.push(new AttributeDef({}).toObject())
				break
			}
			case "threshold": {
				const index = parseInt(el.dataset.itemIndex ?? "")
				if (isNaN(index)) return
				const thresholds = source.attributes[index].thresholds
				if (!thresholds) return
				thresholds.push(new PoolThreshold({}).toObject())
				source.attributes[index].thresholds = thresholds
			}
		}

		this.cachedSettings = source
		await this.render()
	}

	static async #onDeleteItem(this: AttributesConfig, event: Event): Promise<void> {
		event.preventDefault()
		const source = this.cachedSettings.toObject()
		const el = event.target as HTMLElement
		const type = el.dataset.itemType

		switch (type) {
			case "attribute": {
				const index = parseInt(el.dataset.itemIndex ?? "")
				if (isNaN(index)) return
				source.attributes.splice(index, 1)
				break
			}
			case "threshold": {
				const index = parseInt(el.dataset.itemIndex ?? "")
				const parentIndex = parseInt(el.dataset.parentIndex ?? "")
				if (isNaN(index) || isNaN(parentIndex)) return
				const thresholds = source.attributes[parentIndex].thresholds
				if (!thresholds) return
				thresholds.splice(index, 1)
			}
		}

		this.cachedSettings = source
		await this.render()
	}
}

export { AttributesConfig, AttributeSettings }
