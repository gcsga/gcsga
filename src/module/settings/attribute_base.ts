import { SETTINGS, SYSTEM_NAME } from "@module/data";
import { SettingsMenuGURPS } from "./menu";
import { defaultSettings } from "./defaults";

type AttributeBaseSettingField = {
	name: string
	hint: string
	type: typeof Array
	default: Array<any>
}

export abstract class AttributeBaseSettings extends SettingsMenuGURPS {

	static override readonly namespace: SETTINGS

	static override readonly SETTINGS = [] as const

	static readonly ListType = [] as const

	static readonly ObjectType: Record<string, any>

	extension!: string

	exportType!: string


	static override get defaultOptions(): FormApplicationOptions {
		const options = super.defaultOptions
		options.classes.push("gurps", "settings-menu")

		return mergeObject(options, {
			title: `gurps.settings.${this.namespace}.name`,
			id: `${this.namespace}-settings`,
			template: `systems/${SYSTEM_NAME}/templates/system/settings/${this.namespace}.hbs`,
			width: 480,
			height: 600,
			submitOnClose: true,
			submitOnChange: true,
			closeOnSubmit: false,
			resizable: true,
			tabs: [
				{
					navSelector: "nav",
					contentSelector: "section.content",
					initital: "attributes",
				},
			],
		})
	}

	protected static override get settings(): Record<string, AttributeBaseSettingField> {
		return this.SETTINGS.reduce((array, value) => (
			{
				...array, [value]: {
					name: "",
					hint: "",
					type: Array,
					default: defaultSettings[SYSTEM_NAME][`${this.namespace}.${value}`]
				}
			}), {}
		)
	}

	activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)
		// Html.find(".reset-all").on("click", event => this._onResetAll(event))
		html.find(".item").on("dragover", event => this._onDragItem(event))
		html.find(".add").on("click", event => this._onAddItem(event))
		html.find(".delete").on("click", event => this._onDeleteItem(event))
	}


	_onDataImport(event: JQuery.ClickEvent) {
		event.preventDefault()
	}

	// _onDataExport(event: JQuery.ClickEvent) {
	// 	// do nothing
	// 	event.preventDefault()
	// 	const extension = this.extension
	// 	const data = {
	// 		type: this.exportType,
	// 		version: 4,
	// 		rows: game.settings.get(SYSTEM_NAME, `${this.namespace}.attributes`),
	// 	}
	// 	return saveDataToFile(
	// 		JSON.stringify(data, null, "\t"),
	// 		extension,
	// 		`${LocalizeGURPS.translations.gurps.settings.default_attributes.name}.${extension}`
	// 	)
	// }
	//

	// abstract _onDragItem(event: JQuery.ClickEvent): Promise<unknown>
	abstract _onAddItem(event: JQuery.ClickEvent): Promise<unknown>

	abstract _onDeleteItem(event: JQuery.ClickEvent): Promise<unknown>


	async _onDragStart(event: DragEvent) {
		// TODO:update
		const item = $(event.currentTarget!)
		const type = item.data("type")
		const index = Number(item.data("index"))
		const parent_index = Number(item.data("pindex")) || 0
		event.dataTransfer?.setData(
			"text/plain",
			JSON.stringify({
				type: type,
				index: index,
				parent_index: parent_index,
			})
		)
			; (event as any).dragType = type
	}

	protected _onDragItem(event: JQuery.DragOverEvent): void {
		const element = $(event.currentTarget!)
		const heightAcross = (event.pageY! - element.offset()!.top) / element.height()!
		element.siblings(".item").removeClass("border-top").removeClass("border-bottom")
		if (heightAcross > 0.5) {
			element.removeClass("border-top")
			element.addClass("border-bottom")
		} else {
			element.removeClass("border-bottom")
			element.addClass("border-top")
		}
	}


	override async getData(): Promise<any> {
		// const attributes = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`)
		// const effects = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`)
		// return {
		// 	attributes: attributes,
		// 	effects: effects,
		// 	actor: null,
		// 	config: CONFIG.GURPS,
		// }
		return (<typeof AttributeBaseSettings> this.constructor).SETTINGS.reduce((array, value) => (
			{
				...array,
				[value]: game.settings.get(
					SYSTEM_NAME, `${(<typeof AttributeBaseSettings> this.constructor).namespace}.${value}` as any
				)
			}), {
			actor: null,
			config: CONFIG.GURPS
		}
		)
	}
	// {
	// event.preventDefault()
	// event.stopPropagation()
	// const type: string = $(event.currentTarget).data("type")
	// // HACK: idk what I'm doing
	// if ((<typeof AttributeBaseSettings> this.constructor).SETTINGS.includes(type as never)) {
	// 	const list: any[] = game.settings.get(SYSTEM_NAME, `${this.namespace}.${type}`) as any[]
	// 	list.push((<typeof AttributeBaseSettings> this.constructor).ObjectType[type])
	// 	await game.settings.set(SYSTEM_NAME, `${this.namespace}.${type}`, list)
	// 	return this.render()
	// }
	// if (this.constructor().SETTINGS)
	// const attributes: any[] = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`)
	// const effects: any[] = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`)
	// const type: ListType = $(event.currentTarget).data("type")
	// let new_id = ""
	// if (type === ListType.Attribute)
	// 	for (let n = 0; n < 26; n++) {
	// 		const char = String.fromCharCode(97 + n)
	// 		if (![...attributes].find(e => e.id === char)) {
	// 			new_id = char
	// 			break
	// 		}
	// 	}
	// switch (type) {
	// 	case ListType.Attribute:
	// 		// TODO: account for possibility of all letters being taken
	// 		attributes.push({
	// 			type: AttributeType.Integer,
	// 			id: new_id,
	// 			name: "",
	// 			attribute_base: "",
	// 			cost_per_point: 0,
	// 			cost_adj_percent_per_sm: 0,
	// 		})
	// 		await game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`, attributes)
	// 		return this.render()
	// 	case ListType.Thresholds:
	// 		attributes[$(event.currentTarget).data("id")].thresholds ??= []
	// 		attributes[$(event.currentTarget).data("id")].thresholds!.push({
	// 			state: "",
	// 			explanation: "",
	// 			expression: "",
	// 			ops: [],
	// 		})
	// 		await game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`, attributes)
	// 		return this.render()
	// 	case ListType.Effect:
	// 		effects.push({
	// 			attribute: "",
	// 			state: "",
	// 			enter: [],
	// 			leave: [],
	// 		})
	// 		await game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`, effects)
	// 		return this.render()
	// 	case ListType.Enter:
	// 	case ListType.Leave:
	// 		effects[$(event.currentTarget).data("id")][type] ??= []
	// 		effects[$(event.currentTarget).data("id")][type].push({
	// 			id: ConditionID.Reeling,
	// 			action: EFFECT_ACTION.ADD,
	// 		})
	// 		await game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`, effects)
	// 		return this.render()
	// }
}
