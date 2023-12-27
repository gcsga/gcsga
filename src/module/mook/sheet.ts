import { CharacterSheetConfig } from "@actor/character/config_sheet"
import { Attribute, AttributeObj, AttributeType } from "@module/attribute"
import { SYSTEM_NAME } from "@module/data"
import { DiceGURPS } from "@module/dice"
import { LocalizeGURPS } from "@util"
import { Mook } from "./document"
import { MookParser } from "./parse"

export class MookGeneratorSheet extends FormApplication {
	config: CharacterSheetConfig | null = null

	object: Mook

	testing = true

	constructor(options?: Partial<ApplicationOptions>) {
		super(options)
		this.object = new Mook()
			; (game as any).mook = this.object
	}

	static get defaultOptions(): FormApplicationOptions {
		return mergeObject(super.defaultOptions, {
			popOut: true,
			minimizable: true,
			resizable: false,
			width: 800,
			height: "auto",
			template: `systems/${SYSTEM_NAME}/templates/mook-generator/sheet.hbs`,
			classes: ["mook-generator", "gurps"],
			closeOnSubmit: false,
			submitOnChange: true,
			submitOnClose: true,
		})
	}

	get title(): string {
		return LocalizeGURPS.translations.gurps.system.mook.title
	}

	activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)
		html.find("#import").on("click", event => this._onImportText(event))
		html.find("#create").on("click", event => this._onCreateMook(event))
	}

	static async init(): Promise<unknown> {
		const mg = new MookGeneratorSheet()
		return mg.render(true)
	}

	getData(options?: Partial<ApplicationOptions> | undefined): MaybePromise<object> {
		const [primary_attributes, secondary_attributes, point_pools] = this.prepareAttributes(this.object.attributes)

		return mergeObject(super.getData(options), {
			actor: this.object,
			primary_attributes,
			secondary_attributes,
			point_pools,
			button_text: this.testing ?
				LocalizeGURPS.translations.gurps.system.mook.test :
				LocalizeGURPS.translations.gurps.system.mook.create,
			text: {
				traits: this.object.traits.toString(),
				skills: this.object.skills.toString(),
				spells: this.object.spells.toString(),
				equipment: this.object.equipment.toString(),
				melee: this.object.melee.toString(),
				ranged: this.object.traits.toString(),
				catchall: this.object.text.catchall
			}
		})
	}

	prepareAttributes(attributes: Map<string, Attribute>): [Attribute[], Attribute[], Attribute[]] {
		const primary_attributes: Attribute[] = []
		const secondary_attributes: Attribute[] = []
		const point_pools: Attribute[] = []
		if (attributes)
			attributes.forEach(a => {
				if ([AttributeType.Pool, AttributeType.PoolSeparator].includes(a.attribute_def?.type))
					point_pools.push(a)
				else if (a.attribute_def?.isPrimary) primary_attributes.push(a)
				else secondary_attributes.push(a)
			})
		return [primary_attributes, secondary_attributes, point_pools]
	}

	private _onImportText(event: JQuery.ClickEvent) {
		event.preventDefault()
		const data = MookParser.init(this.object.text.catchall, this.object)
			.parseStatBlock(this.object.text.catchall)
		console.log(data)
		this.object.update(data)
		return this.render()
	}

	private _onCreateMook(event: JQuery.ClickEvent) {
		event.preventDefault()
		if (this.testing) {
			this.testing = !this.testMook()
			return this.render()
		}
		else return this.createMook()
	}

	private testMook() {
		console.log(this.object)
		if (this.object.profile.name === "") {
			ui.notifications?.error(LocalizeGURPS.translations.gurps.error.mook.name)
			return false
		}
		return true
	}

	private async createMook() {
		const actor = await this.object.createActor()
		await actor?.sheet?.render(true)
		return this.close()
	}

	protected override _getHeaderButtons(): Application.HeaderButton[] {
		const buttons: Application.HeaderButton[] = []
		const all_buttons = super._getHeaderButtons()
		all_buttons.at(-1)!.label = ""
		all_buttons.at(-1)!.icon = "gcs-circled-x"
		return [...buttons, all_buttons.at(-1)!]
	}

	protected async _updateObject(_event: Event, formData: any): Promise<unknown> {
		for (const i of Object.keys(formData)) {
			if (i.startsWith("attributes.")) {
				const attributes: AttributeObj[] =
					(formData["system.attributes"] as AttributeObj[]) ?? duplicate(this.object.system.attributes)
				const id = i.split(".")[1]
				const att = this.object.attributes.get(id)
				if (att) {
					if (i.endsWith(".adj")) (formData[i] as number) -= att.max - att.adj
					if (i.endsWith(".damage")) (formData[i] as number) = Math.max(att.max - (formData[i] as number), 0)
				}
				const key = i.replace(`attributes.${id}.`, "")
				const index = attributes.findIndex(e => e.attr_id === id)
				setProperty(attributes[index], key, formData[i])
				formData["system.attributes"] = attributes
				delete formData[i]
			}
			if (i === "thrust") formData.thrust = new DiceGURPS(formData.thrust)
			if (i === "swing") formData.swing = new DiceGURPS(formData.swing)
		}
		return this.object.update(formData)
	}
}
