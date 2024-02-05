import { SYSTEM_NAME } from "@module/data/index.ts"
import { ItemGCS } from "./document.ts"
import { LocalizeGURPS } from "@util"
import { ItemSubstitutionSheet } from "./sub_sheet.ts"

type ModifierChoiceSheetOptions = FormApplicationOptions & {
	puuid?: string
}

export class ModifierChoiceSheet<
	TObject extends ItemGCS & { modifiers?: Collection<ItemGCS & { enabled: boolean }> } = ItemGCS & {
		modifiers?: Collection<ItemGCS & { enabled: boolean }>
	},
	TOptions extends ModifierChoiceSheetOptions = ModifierChoiceSheetOptions,
> extends FormApplication<TObject, TOptions> {
	nextObjects: ItemGCS[]

	puuid: string

	choices: Record<string, boolean> = {}

	constructor(items: TObject[], options?: TOptions) {
		const item = items.shift()!
		super(item, options)
		this.object = item
		this.nextObjects = items
		this._init()
		this.puuid = options?.puuid || item.uuid
	}

	private _init() {
		if (this.object.children) {
			this.nextObjects = [...this.nextObjects, ...this.object.children].filter(
				e => e instanceof ItemGCS,
			) as ItemGCS[]
		}
	}

	static override get defaultOptions(): FormApplicationOptions {
		return fu.mergeObject(super.defaultOptions, {
			id: "mod-choice-sheet",
			classes: ["gurps"],
			template: `systems/${SYSTEM_NAME}/templates/item/mod-choice-sheet.hbs`,
			width: 400,
			height: 400,
			resizable: true,
			submitOnChange: true,
			submitOnClose: false,
			closeOnSubmit: false,
		})
	}

	override get title(): string {
		return LocalizeGURPS.format(LocalizeGURPS.translations.gurps.item.substitution.modifiers, {
			name: this.object.name,
		})
	}

	override getData(
		options?: Partial<TOptions>,
	): FormApplicationData<TObject> | Promise<FormApplicationData<TObject>> {
		const choices: Record<string, ItemGCS> = {}
		this.object.modifiers?.forEach(e => {
			choices[e.id] = e
		})
		return fu.mergeObject(super.getData(options), {
			choices,
		})
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)
		html.find("#apply").on("click", event => this._onApply(event))
		html.find("#cancel").on("click", event => this._onCancel(event))
	}

	protected async _onApply(event: JQuery.ClickEvent): Promise<void> {
		event.preventDefault()
		const updates = Object.keys(this.choices).map(k => {
			return { _id: k, "system.disabled": !this.choices[k] }
		})
		await this.object.updateEmbeddedDocuments("Item", updates)
		const items = this.nextObjects
		await this.close()
		ModifierChoiceSheet.new(items, { puuid: this.puuid } as ModifierChoiceSheetOptions)
	}

	protected async _onCancel(event: JQuery.ClickEvent): Promise<void> {
		event.preventDefault()
		const items = this.nextObjects
		await this.close()
		ModifierChoiceSheet.new(items, { puuid: this.puuid } as ModifierChoiceSheetOptions)
	}

	protected override _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
		event.preventDefault()
		for (const k of Object.keys(formData)) {
			this.choices[k] = formData[k] as boolean
		}
		return new Promise(() => {
			return
		})
	}

	static new(
		items: ItemGCS[],
		options?: ModifierChoiceSheetOptions,
	): ModifierChoiceSheet | ItemSubstitutionSheet | null {
		if (items.length === 0) {
			if (options?.puuid) {
				const item = fromUuidSync(options.puuid) as ItemGCS
				return ItemSubstitutionSheet.new([item])
			}
		}
		const sheet = new ModifierChoiceSheet(items, options)
		if (sheet.object.modifiers && sheet.object.modifiers?.size !== 0) {
			return sheet
			// Return sheet?.render(true)
		}
		const newItems = sheet.nextObjects
		return ModifierChoiceSheet.new(
			newItems,
			fu.mergeObject(options ?? {}, { puuid: sheet.puuid }) as ModifierChoiceSheetOptions,
		)
	}
}
