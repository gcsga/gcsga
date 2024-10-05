import { SYSTEM_NAME } from "@module/data/constants.ts"
import { AncestryData, AncestrySchema } from "@module/data/journal-entry-page/ancestry.ts"
import {
	WeightedAncestryOption,
	WeightedStringOption,
	WeightedStringOptionSchema,
	WeightedStringOptionType,
} from "@module/data/journal-entry-page/components/ancestry-options.ts"

type AncestryPage = JournalEntryPage & { system: AncestryData }

class AncestrySheet extends JournalPageSheet<AncestryPage> {
	static override get defaultOptions(): DocumentSheetOptions {
		return {
			...super.defaultOptions,
			submitOnClose: true,
			submitOnChange: true,
		}
	}

	override get template(): string {
		return `systems/${SYSTEM_NAME}/templates/journal/page-${this.document.type}-${this.isEditable ? "edit" : "view"}.hbs`
	}

	override getData(
		options?: Partial<DocumentSheetOptions> | undefined,
	): AncestrySheetData | Promise<AncestrySheetData> {
		const context = super.getData(options)
		return {
			...context,
			page: this.page,
			system: this.page.system,
			source: this.page.system.toObject(),
			fields: this.page.system.schema.fields,
		} as AncestrySheetData
	}

	get page(): AncestryPage {
		return this.document as AncestryPage
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)
		const $html = html[0]
		$html
			.querySelectorAll("button[data-action='addStringOption']")
			.forEach(button => button.addEventListener("click", event => this.#onAddStringOption(event)))
		$html
			.querySelectorAll("button[data-action='deleteStringOption']")
			.forEach(button => button.addEventListener("click", event => this.#onDeleteStringOption(event)))

		$html
			.querySelector("button[data-action='addGenderOption']")
			?.addEventListener("click", event => this.#onAddGenderOption(event))
		$html
			.querySelectorAll("button[data-action='deleteGenderOption']")
			.forEach(button => button.addEventListener("click", event => this.#onDeleteGenderOption(event)))

		$html
			.querySelectorAll("button[data-action='addNameGenerator']")
			.forEach(button => button.addEventListener("click", event => this.#onAddNameGenerator(event)))
		$html
			.querySelectorAll("button[data-action='deleteNameGenerator']")
			.forEach(button => button.addEventListener("click", event => this.#onDeleteNameGenerator(event)))
	}

	async #onAddStringOption(event: Event): Promise<void> {
		event.preventDefault()

		const element = event.target as HTMLButtonElement
		const path = element.dataset.path ?? null
		if (path === null) return
		const type = path.split(".").pop() as WeightedStringOptionType

		const stringOptions = fu.getProperty(
			this.page.toObject(),
			path,
		) as SourceFromSchema<WeightedStringOptionSchema>[]
		stringOptions.push(new WeightedStringOption({ type }).toObject())

		await this.page.update({ [path]: stringOptions })
	}

	async #onDeleteStringOption(event: Event): Promise<void> {
		event.preventDefault()

		const element = event.target as HTMLButtonElement
		const index = parseInt(element.dataset.index ?? "")
		if (isNaN(index)) return
		const path = element.dataset.path ?? null
		if (path === null) return

		const stringOptions = fu.getProperty(this.page, path) as WeightedStringOption[]
		stringOptions.splice(index, 1)

		await this.page.update({ [path]: stringOptions })
	}

	async #onAddNameGenerator(event: Event): Promise<void> {
		event.preventDefault()

		const element = event.target as HTMLButtonElement
		const path = element.dataset.path ?? null
		if (path === null) return

		const nameGenerators = fu.getProperty(this.page.toObject(), path) as string[]
		nameGenerators.push("")

		await this.page.update({ [path]: nameGenerators })
	}

	async #onDeleteNameGenerator(event: Event): Promise<void> {
		event.preventDefault()

		const element = event.target as HTMLButtonElement
		const index = parseInt(element.dataset.index ?? "")
		if (isNaN(index)) return
		const path = element.dataset.path ?? null
		if (path === null) return

		const nameGenerators = fu.getProperty(this.page, path) as string[]
		nameGenerators.splice(index, 1)

		await this.page.update({ [path]: nameGenerators })
	}

	async #onAddGenderOption(event: Event): Promise<void> {
		event.preventDefault()

		const genderOptions = this.page.system.toObject().gender_options
		genderOptions.push(new WeightedAncestryOption().toObject())

		await this.page.update({ "system.gender_options": genderOptions })
	}

	async #onDeleteGenderOption(event: Event): Promise<void> {
		event.preventDefault()

		const element = event.target as HTMLButtonElement
		const index = parseInt(element.dataset.index ?? "")
		if (isNaN(index)) return

		const genderOptions = this.page.system.gender_options
		genderOptions.splice(index, 1)

		await this.page.update({ "system.gender_options": genderOptions })
	}
}

interface AncestrySheet {
	constructor: typeof AncestrySheet
}

interface AncestrySheetData extends DocumentSheetData<AncestryPage> {
	page: AncestryPage
	system: AncestryData
	source: SourceFromSchema<AncestrySchema>
	fields: foundry.data.fields.SchemaField<AncestrySchema>["fields"]
}

export { AncestrySheet }
