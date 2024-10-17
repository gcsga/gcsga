import { ItemDataModel } from "./abstract.ts"
import fields = foundry.data.fields
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { StringBuilder, align, cell, container, display, selfctrl } from "@util"
import { PrereqTemplate, PrereqTemplateSchema } from "./templates/prereqs.ts"
import { ContainerTemplate, ContainerTemplateSchema } from "./templates/container.ts"
import { ItemType } from "../constants.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import { CellData } from "./components/cell-data.ts"
import { SheetSettings } from "../sheet-settings.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { ItemInst, calculateModifierPoints } from "./helpers.ts"
import { TemplatePicker } from "./fields/template-picker.ts"
import { Nameable } from "@module/util/index.ts"
import { MaybePromise } from "../types.ts"
import { ItemTemplateType } from "./types.ts"

class TraitContainerData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	PrereqTemplate,
	ContainerTemplate,
	ReplacementTemplate,
) {
	static override _systemType = ItemType.TraitContainer

	static override childTypes = new Set([ItemType.Trait, ItemType.TraitContainer])
	static override modifierTypes = new Set([ItemType.TraitModifier, ItemType.TraitModifierContainer])

	override async getSheetData(context: Record<string, unknown>): Promise<void> {
		context.detailsParts = ["gurps.details-trait-container", "gurps.details-prereqs"]
		context.embedsParts = ["gurps.embeds-weapon-melee", "gurps.embeds-weapon-ranged"]
	}

	static override defineSchema(): TraitContainerSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			ancestry: new fields.ForeignDocumentField(JournalEntryPage, {
				nullable: true,
				initial: null,
				idOnly: true,
				label: "GURPS.Item.TraitContainer.FIELDS.Ancestry.Name",
			}),
			userdesc: new fields.StringField({
				required: true,
				nullable: false,
				initial: "",
				label: "GURPS.Item.Trait.FIELDS.UserDesc.Name",
			}),
			cr: new fields.NumberField({
				required: true,
				nullable: false,
				choices: selfctrl.RollsChoices,
				initial: selfctrl.Roll.NoCR,
				label: "GURPS.Item.Trait.FIELDS.Cr.Name",
			}),
			cr_adj: new fields.StringField({
				required: true,
				nullable: false,
				choices: selfctrl.AdjustmentsChoices,
				initial: selfctrl.Adjustment.NoCRAdj,
				label: "GURPS.Item.Trait.FIELDS.CrAdj.Name",
			}),
			container_type: new fields.StringField({
				required: true,
				nullable: false,
				choices: container.TypesChoices,
				initial: container.Type.Group,
				label: "GURPS.Item.TraitContainer.FIELDS.ContainerType.Name",
			}),
			disabled: new fields.BooleanField({
				required: true,
				nullable: false,
				initial: false,
				label: "GURPS.Item.Trait.FIELDS.Disabled.Name",
			}),
			template_picker: new fields.EmbeddedDataField(TemplatePicker),
		}) as TraitContainerSchema
	}

	get ancestryChoices(): Record<string, string> {
		const ancestries: Record<string, string> = { "": "" }
		for (const entry of game.journal) {
			for (const page of entry.pages) {
				if (page.type === "ancestry") ancestries[page.id] = page.name
			}
		}
		return ancestries
	}

	override get cellData(): Record<string, CellData> {
		const cellData: Record<string, CellData> = {}
		cellData.name = new CellData({
			type: cell.Type.Text,
			primary: this.nameWithReplacements,
			secondary: this.secondaryText(display.Option.isInline),
			disabled: !this.enabled,
			unsatisfiedReason: this.unsatisfiedReason,
			tooltip: this.secondaryText(display.Option.isTooltip),
		})
		cellData.points = new CellData({
			type: cell.Type.Text,
			primary: this.adjustedPoints.toString(),
			alignment: align.Option.End,
		})
		cellData.tags = new CellData({
			type: cell.Type.Tags,
			primary: this.combinedTags,
		})
		cellData.reference = new CellData({
			type: cell.Type.PageRef,
			primary: this.reference,
			secondary: this.reference_highlight === "" ? this.nameWithReplacements : this.reference_highlight,
		})
		return cellData
	}

	get processedName(): string {
		return this.nameWithReplacements
	}

	get enabled(): boolean {
		const container = this.parent.container as ItemGURPS2 | null
		return !this.disabled && container?.isOfType(ItemType.TraitContainer) ? container.system.enabled : true
	}

	// Parity with Trait when needed
	get isLeveled(): boolean {
		return false
	}

	// Parity with Trait when needed
	get levels(): number {
		return 0
	}

	// Parity with Trait when needed
	get currentLevel(): number {
		return 0
	}

	/** Returns trait point cost adjusted for enablement and modifiers */
	get adjustedPoints(): number {
		let points = 0
		if (this.container_type === container.Type.AlternativeAbilities) {
			const values: number[] = []
			;(this.children as Collection<ItemGURPS2>).forEach(child => {
				if (!child.isOfType(ItemType.Trait, ItemType.TraitContainer)) return
				const adjustedPoints = child.system.adjustedPoints
				values.push(adjustedPoints)
				if (adjustedPoints > points) points = adjustedPoints
			})
			const maximum = points
			let found = false
			for (const value of values) {
				if (!found && maximum === value) {
					found = true
				} else {
					points += Math.ceil(calculateModifierPoints(value, 20))
				}
			}
		} else {
			;(this.children as Collection<ItemGURPS2>).forEach(child => {
				if (!child.isOfType(ItemType.Trait, ItemType.TraitContainer)) return
				points += child.system.adjustedPoints
			})
		}
		return points
	}

	override get allModifiers(): MaybePromise<Collection<ItemInst<ItemType.TraitModifier>>> {
		if (!this.parent) return new Collection()
		if (this.parent.pack) return this._allModifiers()

		const allModifiers = new Collection<ItemInst<ItemType.TraitModifier>>()

		for (const item of <Collection<ItemGURPS2>>this.contents) {
			if (item.type === ItemType.TraitModifier) allModifiers.set(item.id, <ItemInst<ItemType.TraitModifier>>item)

			if (item.hasTemplate(ItemTemplateType.Container))
				for (const contents of <Collection<ItemGURPS2>>item.system.allContents) {
					if (contents.type === ItemType.TraitModifier)
						allModifiers.set(contents.id, <ItemInst<ItemType.TraitModifier>>contents)
				}
		}
		return allModifiers
	}

	private async _allModifiers(): Promise<Collection<ItemInst<ItemType.TraitModifier>>> {
		const allModifiers = new Collection<ItemInst<ItemType.TraitModifier>>()

		for (const item of await this.contents) {
			if (item.type === ItemType.TraitModifier) allModifiers.set(item.id, <ItemInst<ItemType.TraitModifier>>item)

			if (item.hasTemplate(ItemTemplateType.Container))
				for (const contents of await item.system.allContents) {
					if (contents.type === ItemType.TraitModifier)
						allModifiers.set(contents.id, <ItemInst<ItemType.TraitModifier>>contents)
				}
		}
		return allModifiers
	}

	// Returns rendered notes from modifiers
	get modifierNotes(): MaybePromise<string> {
		const buffer = new StringBuilder()

		if (this.cr !== selfctrl.Roll.NoCR) {
			buffer.push(selfctrl.Roll.toRollableButton(this.cr))
			if (this.cr_adj !== selfctrl.Adjustment.NoCRAdj) {
				if (buffer.length !== 0) buffer.push(", ")
				buffer.push(selfctrl.Adjustment.description(this.cr_adj, this.cr))
			}
		}
		const modifiers = this.allModifiers
		if (modifiers instanceof Promise) return this._modifierNotes(buffer, modifiers)

		modifiers.forEach(mod => {
			if (mod.system.disabled) return
			if (buffer.length !== 0) buffer.push("; ")
			buffer.push(mod.system.fullDescription)
		})
		return buffer.toString()
	}

	private async _modifierNotes(
		buffer: StringBuilder,
		modifiers: Promise<Collection<ItemInst<ItemType.TraitModifier>>>,
	): Promise<string> {
		const resolvedModifiers = await Promise.resolve(modifiers)

		resolvedModifiers.forEach(mod => {
			if (mod.system.disabled) return
			if (buffer.length !== 0) buffer.push("; ")
			buffer.push(mod.system.fullDescription)
		})
		return buffer.toString()
	}

	secondaryText(optionChecker: (option: display.Option) => boolean): string {
		const buffer = new StringBuilder()
		const settings = SheetSettings.for(this.parent.actor)
		const userDesc = this.userDescWithReplacements
		if (userDesc !== "" && optionChecker(settings.user_description_display)) {
			buffer.push(userDesc)
		}
		if (optionChecker(settings.modifiers_display)) {
			// TODO: check if we can avoid async here
			buffer.appendToNewLine(this.modifierNotes as string)
		}
		if (optionChecker(settings.notes_display)) {
			buffer.appendToNewLine(this.processedNotes)
		}
		return buffer.toString()
	}

	/** Replacements */
	override get nameWithReplacements(): string {
		return Nameable.apply(this.parent.name, this.nameableReplacements)
	}

	override get notesWithReplacements(): string {
		return Nameable.apply(this.notes, this.nameableReplacements)
	}

	get userDescWithReplacements(): string {
		return Nameable.apply(this.userdesc, this.nameableReplacements)
	}

	/** Nameables */
	override fillWithNameableKeys(
		m: Map<string, string>,
		existing: Map<string, string> = this.nameableReplacements,
	): void {
		super.fillWithNameableKeys(m, existing)

		Nameable.extract(this.notes, m, existing)
		Nameable.extract(this.userdesc, m, existing)

		this._fillWithNameableKeysFromPrereqs(m, existing)
		this._fillWithNameableKeysFromEmbeds(m, existing)
	}

	protected async _fillWithNameableKeysFromEmbeds(
		m: Map<string, string>,
		existing: Map<string, string>,
	): Promise<void> {
		const modifiers = await this.allModifiers
		const weapons = await this.weapons

		for (const modifier of modifiers) {
			modifier.system.fillWithNameableKeys(m, modifier.system.nameableReplacements)
		}
		for (const weapon of weapons) {
			weapon.system.fillWithNameableKeys(m, existing)
		}
	}
}

interface TraitContainerData extends ModelPropsFromSchema<TraitContainerSchema> {
	get children(): MaybePromise<Collection<ItemInst<ItemType.Trait | ItemType.TraitContainer>>>
	get weapons(): MaybePromise<Collection<ItemInst<ItemType.WeaponMelee | ItemType.WeaponRanged>>>
}

type TraitContainerSchema = BasicInformationTemplateSchema &
	PrereqTemplateSchema &
	ContainerTemplateSchema &
	ReplacementTemplateSchema & {
		ancestry: fields.ForeignDocumentField<string, true, true, true>
		userdesc: fields.StringField<string, string, true, false, true>
		cr: fields.NumberField<selfctrl.Roll, selfctrl.Roll, true, false, true>
		cr_adj: fields.StringField<selfctrl.Adjustment, selfctrl.Adjustment, true, false, true>
		container_type: fields.StringField<container.Type, container.Type, true, false, true>
		disabled: fields.BooleanField<boolean, boolean, true, false, true>
		template_picker: fields.EmbeddedDataField<TemplatePicker, true, false, true>
	}

export { TraitContainerData, type TraitContainerSchema }
