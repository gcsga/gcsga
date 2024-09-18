import { SETTINGS, SYSTEM_NAME } from "@module/data/constants.ts"
import fields = foundry.data.fields
import api = foundry.applications.api
import { AttributeDef, AttributeDefSchema } from "@module/data/attribute/attribute-definition.ts"
import { DEFAULT_ATTRIBUTE_SETTINGS } from "./defaults/data.ts"

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
	static override DEFAULT_OPTIONS = {
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
		},
	}

	static override PARTS = {
		attributes: {
			id: "attributes",
			template: `systems/${SYSTEM_NAME}/templates/apps/attributes-config.hbs`,
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

	override async _prepareContext(_options = {}) {
		const current = game.settings.get(SYSTEM_NAME, SETTINGS.DEFAULT_ATTRIBUTES)
		const data = this.#prepareAttributes(current)
		return {
			attributes: data.attributes,
			source: current,
			buttons: [
				{
					type: "reset",
					action: "reset",
					icon: "fa-solid fa-sync",
					label: "GURPS.Settings.SheetSettings.Reset",
				},
				{ type: "submit", icon: "fa-solid fa-save", label: "GURPS.Settings.SheetSettings.Submit" },
			],
		}
	}

	#prepareAttributes(current: AttributeSettings): AttributeSettings {
		return current
	}

	// protected override _onRender(context: object, options: ApplicationRenderOptions): void {
	// 	// Set the initial value for the progression hint text
	// 	const progressionField = this.element.querySelector(`select[name="damage_progression"]`) as HTMLSelectElement
	// 	const hintElement = this.element.querySelector("div.form-group.damage-progression p.hint") as HTMLElement
	// 	console.log(progressionField)
	// 	console.log(hintElement)
	// 	const progressionValue = progressionField?.value as progression.Option
	// 	const hintText = game.i18n.localize(progression.Option.toAltString(progressionValue))
	// 	if (hintElement) hintElement.innerHTML = hintText
	//
	// 	// Dynamically update the hint text wen the progression value is changed
	// 	progressionField?.addEventListener("change", e => {
	// 		e.preventDefault()
	// 		e.stopImmediatePropagation()
	// 		const newValue = (e.currentTarget as any).value
	// 		const hintText = game.i18n.localize(progression.Option.toAltString(newValue))
	// 		if (hintElement) hintElement.innerHTML = hintText
	// 	})
	// 	return super._onRender(context, options)
	// }

	static async #onSubmit(
		event: Event | SubmitEvent,
		form: HTMLFormElement,
		formData: FormDataExtended,
	): Promise<void> {
		event.preventDefault()

		console.log(event)
		console.log(form)
		console.log(formData)
	}

	static async #onReset(event: Event): Promise<void> {
		event.preventDefault()

		const defaults = game.settings.settings.get(`${SYSTEM_NAME}.${SETTINGS.DEFAULT_SHEET_SETTINGS}`).default
		await game.settings.set(SYSTEM_NAME, SETTINGS.DEFAULT_SHEET_SETTINGS, defaults)
		ui.notifications.info("GURPS.Settings.SheetSettings.MessageReset", { localize: true })
		// HACK: to fix when types catch up
		await (this as unknown as api.ApplicationV2).render()
	}
}

export { AttributesConfig, AttributeSettings }
