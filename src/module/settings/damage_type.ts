import { SETTINGS, SYSTEM_NAME } from "@module/data"
import { SettingsMenuGURPS } from "@module/settings/menu"
import { prepareFormData } from "@util"

type CustomDamageType = {
	id: string
	short_name: string
	full_name: string
	pool_id: string
}

export class DamageTypeSettings extends SettingsMenuGURPS {
	static override readonly namespace = "damage_types"

	static readonly TYPES = "types"

	static override readonly SETTINGS = [DamageTypeSettings.TYPES] as const

	static override get defaultOptions(): FormApplicationOptions {
		const options = super.defaultOptions
		options.classes.push("gurps")
		options.classes.push("settings-menu")

		return mergeObject(options, {
			title: `gurps.settings.${SETTINGS.DAMAGE_TYPES}.name`,
			id: `${SETTINGS.DAMAGE_TYPES}-settings`,
			template: `systems/${SYSTEM_NAME}/templates/system/settings/${SETTINGS.DAMAGE_TYPES}.hbs`,
			width: 480,
			height: "auto",
			submitOnClose: true,
			submitOnChange: true,
			closeOnSubmit: false,
			resizable: true,
		} as FormApplicationOptions)
	}

	protected static override get settings(): Record<string, any> {
		return {
			types: {
				name: "",
				hint: "",
				type: Array,
				default: <CustomDamageType[]>[],
			},
		}
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)

		html.find("[data-action]").on("change click", event => this._onApplyControl(event))
	}

	_onDataImport(event: JQuery.ClickEvent) {
		event.preventDefault()
	}

	_onDataExport(event: JQuery.ClickEvent) {
		event.preventDefault()
	}

	_onApplyControl(event: JQuery.Event) {
		if (event.type === "click") {
			const e = event as JQuery.ClickEvent
			if (["A"].includes(e.currentTarget.tagName)) {
				this._onApplyControlClick(e, e.currentTarget)
			}
		}

		if (event.type === "change") {
			const e = event as JQuery.ChangeEvent
			if (["number", "text"].includes(e.currentTarget.type)) {
				this._onApplyControlChange(e, e.currentTarget)
			}
		}
	}

	async _onApplyControlChange(event: JQuery.ChangeEvent, target: any): Promise<void> {
		event.preventDefault()

		switch (target.dataset.action) {
			case "location-select": {
				// const value = parseInt(target.value)
				// this.calculator.damageRoll.locationId = target.value
				break
			}
		}

		this.render(true)
	}

	async _onApplyControlClick(event: JQuery.ClickEvent, target: any): Promise<void> {
		event.preventDefault()

		switch (target.dataset.action) {
			case "add-damage":
				const damagetypes: any[] =
					game.settings.get(SYSTEM_NAME, `${SETTINGS.DAMAGE_TYPES}.${DamageTypeSettings.TYPES}`) ?? []
				damagetypes.push({
					id: "new",
					short_name: "new",
					full_name: "New Damage Type",
					pool_id: "pool",
				})
				await game.settings.set(
					SYSTEM_NAME,
					`${SETTINGS.DAMAGE_TYPES}.${DamageTypeSettings.TYPES}`,
					damagetypes
				)
				break
		}

		this.render(true)
	}

	override async getData(): Promise<any> {
		const types = game.settings.get(
			SYSTEM_NAME,
			`${SETTINGS.DAMAGE_TYPES}.${DamageTypeSettings.TYPES}`
		) as CustomDamageType[]
		return {
			types: types,
			config: CONFIG.GURPS,
		}
	}

	protected override async _updateObject(_event: Event, formData: any): Promise<void> {
		const types = game.settings.get(SYSTEM_NAME, `${SETTINGS.DAMAGE_TYPES}.${DamageTypeSettings.TYPES}`)
		formData = prepareFormData(formData, { types: types })
		await game.settings.set(SYSTEM_NAME, `${SETTINGS.DAMAGE_TYPES}.${DamageTypeSettings.TYPES}`, formData.types)
	}
}
