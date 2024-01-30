import { ActorGURPS, ActorType } from "@actor"
import { TokenDocumentGURPS } from "@module/token/document.ts"
import { LootSettings, LootSource, LootSystemSource } from "./data.ts"
import { FilePickerGURPS, LocalizeGURPS, Weight, WeightUnits } from "@util"
import { Int } from "@util/fxp.ts"
import { EquipmentContainerGURPS, EquipmentGURPS, ItemGCS, ModifierChoiceSheet } from "@item"
import { ItemType } from "@item/types.ts"
import { ItemGURPS } from "@item/base/document.ts"
import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { CharacterThirdPartyData } from "@actor/character/data.ts"
import { SETTINGS, SYSTEM_NAME } from "@module/data/misc.ts"
import { ItemFlags } from "@item/data.ts"
import { DialogGURPS } from "@ui"
import { CharacterImporter } from "@actor/character/import.ts"

interface LootGURPS<TParent extends TokenDocumentGURPS | null = TokenDocumentGURPS | null> extends ActorGURPS<TParent> {
	system: LootSystemSource
	type: ActorType.Loot
}

class LootGURPS<TParent extends TokenDocumentGURPS | null = TokenDocumentGURPS | null> extends ActorGURPS<TParent> {
	protected override _preUpdate(
		changed: DeepPartial<this["_source"]>,
		options: DocumentModificationContext<TParent>,
		user: foundry.documents.BaseUser,
	): Promise<void> {
		changed = fu.mergeObject(changed, {
			...this._checkImport(changed),
		})
		return super._preUpdate(changed, options, user)
	}

	private _checkImport(data: DeepPartial<this["_source"]>): DeepPartial<LootSource> {
		if (fu.hasProperty(data, "system.import")) return {}
		if (Object.keys(data).some(e => e.includes("ownership"))) return {}
		const additionalData: DeepPartial<LootSource> = {}
		fu.setProperty(additionalData, "system.modified_date", new Date().toISOString())
		return additionalData
	}

	get weightUnits(): WeightUnits {
		return this.settings.default_weight_units
	}

	get importData(): this["system"]["import"] {
		return this.system.import
	}

	get settings(): LootSettings {
		return this.system.settings
	}

	get created_date(): string {
		return this.system.created_date
	}

	get modified_date(): string {
		return this.system.created_date
	}

	get fastWealthCarried(): string {
		return `$${this.wealthCarried()}`
	}

	get fastWeightCarried(): string {
		return Weight.format(this.weightCarried(false), this.weightUnits)
	}

	weightCarried(for_skills: boolean): number {
		let total = 0
		this.equipment.forEach(e => {
			if (e.parent === this) {
				total += e.extendedWeight(for_skills, this.settings.default_weight_units)
			}
		})
		return Int.from(total, 4)
	}

	wealthCarried(): number {
		let value = 0
		for (const e of this.equipment) {
			if (e.parent === this) value += e.extendedValue
		}
		return Int.from(value, 4)
	}

	get fastWealthNotCarried(): string {
		return `$${this.wealthNotCarried()}`
	}

	wealthNotCarried(): number {
		let value = 0
		this.otherEquipment.forEach(e => {
			if (e.container === this) value += e.extendedValue
		})
		return Int.from(value, 4)
	}

	override get itemTypes(): Record<ItemType, ItemGURPS[]> {
		return super.itemTypes as Record<ItemType, ItemGURPS[]>
	}

	get equipment(): Collection<EquipmentGURPS | EquipmentContainerGURPS> {
		return new Collection(
			[...this.itemTypes[ItemType.Equipment], ...this.itemTypes[ItemType.EquipmentContainer]].map(e => [
				e.id,
				e,
			]) as readonly [string, Item][],
		) as Collection<EquipmentGURPS | EquipmentContainerGURPS>
	}

	get carriedEquipment(): Collection<EquipmentGURPS | EquipmentContainerGURPS> {
		return new Collection(
			this.equipment
				.filter(item => !item.other)
				.map(item => {
					return [item.id, item]
				}),
		)
	}

	get otherEquipment(): Collection<EquipmentGURPS | EquipmentContainerGURPS> {
		return new Collection(
			this.equipment
				.filter(item => item.other)
				.map(item => {
					return [item.id, item]
				}),
		)
	}

	protected override _onCreateDescendantDocuments(
		parent: this,
		collection: "effects" | "items",
		documents: ActiveEffect<this>[] | Item<this>[],
		result: ActiveEffect<this>["_source"][] | Item<this>["_source"][],
		options: DocumentModificationContext<this> & { substitutions: boolean },
		userId: string,
	): void {
		super._onCreateDescendantDocuments(parent, collection, documents, result, options, userId)
		// Replace @X@ notation fields with given text
		if (collection === "items" && options.substitutions) {
			for (const item of documents.filter(e => e instanceof ItemGCS)) {
				const sheet = ModifierChoiceSheet.new([item as ItemGCS<this>])
				if (game.userId === userId) sheet?.render(true)
			}
		}
	}

	override prepareEmbeddedDocuments(): void {
		super.prepareEmbeddedDocuments()
		this.processPrereqs()
	}

	processPrereqs(): void {
		const not_met = LocalizeGURPS.translations.gurps.prereq.not_met
		for (const e of this.equipment) {
			e.unsatisfiedReason = ""
			if (!e.prereqsEmpty) {
				const tooltip = new TooltipGURPS()
				if (!e.prereqs.satisfied(this, e, tooltip)) {
					e.unsatisfiedReason = not_met + tooltip.toString()
				}
			}
		}
	}

	async saveLocal(): Promise<void> {
		const json = await this.exportSystemData()
		return fu.saveDataToFile(json.text, "gcs", json.name)
	}

	protected async exportSystemData(): Promise<{ text: string; name: string }> {
		const system: DeepPartial<LootSystemSource> & Record<string, unknown> = { ...fu.duplicate(this.system) }
		system.type = "character"
		const items = (this.items as unknown as Collection<ItemGURPS>)
			.filter(e => !e.getFlag(SYSTEM_NAME, ItemFlags.Container))
			.map((e: ItemGURPS) => e.exportSystemData(true))
		const third_party: DeepPartial<CharacterThirdPartyData> = {}

		third_party.import = system.import
		third_party.move = system.move
		system.third_party = third_party
		system.equipment = items
		const json = JSON.stringify(system, null, "\t")
		const filename = `${this.name}.gcs`

		return { text: json, name: filename }
	}

	async promptImport(): Promise<void> {
		const dialog = new DialogGURPS({
			title: LocalizeGURPS.translations.gurps.character.import_prompt.title,
			content: await renderTemplate(`systems/${SYSTEM_NAME}/templates/actor/import-prompt.hbs`, { object: this }),
			buttons: {
				import: {
					icon: '<i class="fas fa-file-import"></i>',
					label: LocalizeGURPS.translations.gurps.character.import_prompt.import,
					callback: () => {
						let file: { name: string; text: string; path: string } | null = null
						if (game.settings.get(SYSTEM_NAME, SETTINGS.SERVER_SIDE_FILE_DIALOG)) {
							const filepicker = new FilePickerGURPS({
								callback: (path: string) => {
									const request = new XMLHttpRequest()
									request.open("GET", path)
									new Promise(resolve => {
										request.onload = () => {
											if (request.status === 200) {
												const text = request.response
												file = {
													text: text,
													name: path,
													path: request.responseURL,
												}
												CharacterImporter.import(this, file)
											}
											resolve(this)
										}
									})
									request.send(null)
								},
							})
							filepicker.extension = [".gcs", ".xml", ".gca5"]
							filepicker.render(true)
						} else {
							const inputEl = document.createElement("input")
							inputEl.type = "file"
							$(inputEl).on("change", event => {
								const rawFile = $(event.currentTarget).prop("files")[0]
								file = {
									text: "",
									name: rawFile.name,
									path: rawFile.path,
								}
								fu.readTextFromFile(rawFile).then(text => {
									CharacterImporter.import(this, {
										text: text,
										name: rawFile.name,
										path: rawFile.path,
									})
								})
							})
							$(inputEl).trigger("click")
						}
					},
				},
			},
		})
		dialog.render(true)
	}
}

export { LootGURPS }
