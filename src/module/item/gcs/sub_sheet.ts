import { ItemGURPS } from "@item"
import { ItemGCS } from "./document.ts"
import { SYSTEM_NAME } from "@module/data/index.ts"
import { LocalizeGURPS, prepareFormData } from "@util"

export class ItemSubstitutionSheet<
	TObject extends ItemGCS = ItemGCS,
	TOptions extends FormApplicationOptions = FormApplicationOptions,
> extends FormApplication<TObject, TOptions> {
	nextObjects: ItemGCS[]

	subs: Record<string, string> = {}

	keys: Record<string, string[]> = {}

	constructor(items: TObject[], options?: TOptions) {
		const item = items.shift()!
		super(item, options)
		this.object = item
		this.nextObjects = items
		this._init()
	}

	private _init() {
		const obj = { ...fu.duplicate(this.object) }
		if (this.object.modifiers) {
			const objList = {} as Record<number, ItemGURPS>
			const list = this.object.items
			for (let i = 0; i < list.size; i++) {
				const e = list.contents[i]
				if (
					(this.object.modifiers.has(e.id) && this.object.modifiers.get(e.id)?.enabled) ||
					!this.object.modifiers.has(e.id)
				)
					objList[i] = e
			}
		}
		const flatItem = fu.flattenObject(obj) as Record<string, string>
		if (!flatItem) return
		for (const k of Object.keys(flatItem)) {
			if (typeof flatItem[k] === "string" && flatItem[k].length > 2 && flatItem[k].match(/@[^@]*@/)) {
				for (const j of flatItem[k].match(/@[^@]*@/g)!) {
					const key = j.slice(1, -1)
					if (this.keys[key]) this.keys[key] = [...this.keys[key], k]
					else this.keys[key] = [k]
					this.subs[key] = ""
				}
			}
		}
	}

	static override get defaultOptions(): FormApplicationOptions {
		return fu.mergeObject(super.defaultOptions, {
			id: "sub-sheet",
			classes: ["gurps"],
			template: `systems/${SYSTEM_NAME}/templates/item/sub-sheet.hbs`,
			width: 400,
			height: 400,
			resizable: true,
			submitOnChange: true,
			submitOnClose: false,
			closeOnSubmit: false,
		})
	}

	override get title(): string {
		return LocalizeGURPS.format(LocalizeGURPS.translations.gurps.item.substitution.title, {
			name: this.object.name,
		})
	}

	override getData(
		options?: Partial<TOptions>,
	): FormApplicationData<TObject> | Promise<FormApplicationData<TObject>> {
		return fu.mergeObject(super.getData(options), {
			subs: this.subs,
		})
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)
		html.find("#apply").on("click", event => this._onApply(event))
		html.find("#cancel").on("click", () => this.close())
	}

	protected async _onApply(event: JQuery.ClickEvent): Promise<void> {
		event.preventDefault()
		let update: Record<string, unknown> = { _id: this.object._id }
		for (const k of Object.keys(this.subs)) {
			for (const j of this.keys[k]) {
				const key = j.startsWith("array.") ? j.replace("array.", "") : j
				if (!update[j]) update[j] = fu.getProperty(this.object, key) || ""
				update[j] = (update[j] as string).replaceAll(`@${k}@`, this.subs[k])
			}
		}
		update = prepareFormData(update, { ...this.object })
		this.object.update(update)
		await this.close()
	}

	protected async _updateObject(event: Event, formData: Record<string, unknown>): Promise<unknown> {
		event.preventDefault()
		for (const k of Object.keys(formData)) {
			this.subs[k] = formData[k] as string
		}
		return new Promise(() => {
			return
		})
	}

	static new(items: ItemGCS[]): ItemSubstitutionSheet | null {
		if (items.length === 0) return null
		const sheet = new ItemSubstitutionSheet(items)
		if (Object.keys(sheet.subs).length === 0) return null
		// Return sheet.render(true)
		return sheet
	}
}
