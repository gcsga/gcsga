import { ItemDataModel } from "../abstract.ts"
import fields = foundry.data.fields
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { StringBuilder, align, cell, container, display, selfctrl } from "@util"
import { PrereqTemplate, PrereqTemplateSchema } from "./templates/prereqs.ts"
import { ContainerTemplate, ContainerTemplateSchema } from "./templates/container.ts"
import { ItemType } from "../constants.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import { CellData } from "./fields/cell-data.ts"
import { SheetSettings } from "../sheet-settings.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { Nameable } from "@module/util/nameable.ts"
import { TraitModifierData } from "./trait-modifier.ts"
import { TemplatePicker, TemplatePickerSchema } from "./fields/template-picker.ts"
import { calculateModifierPoints } from "./helpers.ts"

class TraitContainerData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	PrereqTemplate,
	ContainerTemplate,
	ReplacementTemplate,
) {
	static override _systemType = ItemType.TraitContainer

	static override childTypes = new Set([ItemType.Trait, ItemType.TraitContainer])
	static override modifierTypes = new Set([ItemType.TraitModifier, ItemType.TraitModifierContainer])

	static override defineSchema(): TraitContainerSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			ancestry: new fields.StringField({ required: true, nullable: false, initial: "" }),
			userdesc: new fields.StringField({ required: true, nullable: false, initial: "" }),
			cr: new fields.NumberField({
				required: true,
				nullable: false,
				choices: selfctrl.Rolls,
				initial: selfctrl.Roll.NoCR,
			}),
			cr_adj: new fields.StringField({
				required: true,
				nullable: false,
				choices: selfctrl.Adjustments,
				initial: selfctrl.Adjustment.NoCRAdj,
			}),
			container_type: new fields.StringField({
				required: true,
				nullable: false,
				choices: container.Types,
				initial: container.Type.Group,
			}),
			disabled: new fields.BooleanField({ required: true, nullable: false, initial: false }),
			template_picker: new fields.SchemaField(TemplatePicker.defineSchema()),
		}) as TraitContainerSchema
	}

	override get cellData(): Record<string, CellData> {
		const cellData: Record<string, CellData> = {}
		cellData.name = new CellData({
			type: cell.Type.Text,
			primary: this.nameWithReplacements,
			secondar: this.secondaryText(display.Option.isInline),
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

	get enabled(): boolean {
		const container = this.parent.container as ItemGURPS2 | null
		return !this.disabled && container?.isOfType(ItemType.TraitContainer) ? container.system.enabled : true
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

	get allModifiers(): Collection<ItemGURPS2 & { system: TraitModifierData }> {
		return new Collection(
			Object.values(this.modifiers)
				.filter(e => e.isOfType(ItemType.TraitModifier))
				.map(e => [e.id, e]),
		)
	}

	// Returns rendered notes from modifiers
	get modifierNotes(): string {
		const buffer = new StringBuilder()
		if (this.cr !== selfctrl.Roll.NoCR) {
			buffer.push(selfctrl.Roll.toRollableButton(this.cr))
			if (this.cr_adj !== selfctrl.Adjustment.NoCRAdj) {
				if (buffer.length !== 0) buffer.push(", ")
				buffer.push(selfctrl.Adjustment.description(this.cr_adj, this.cr))
			}
		}
		this.allModifiers.forEach(mod => {
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
			buffer.appendToNewLine(this.modifierNotes)
		}
		if (optionChecker(settings.notes_display)) {
			buffer.appendToNewLine(this.processedNotes)
		}
		return buffer.toString()
	}

	/** Replacements */
	override get nameWithReplacements(): string {
		return Nameable.apply(this.name, this.nameableReplacements)
	}

	override get notesWithReplacements(): string {
		return Nameable.apply(this.notes, this.nameableReplacements)
	}

	get userDescWithReplacements(): string {
		return Nameable.apply(this.userdesc, this.nameableReplacements)
	}

	/** Nameables */
	fillWithNameableKeys(m: Map<string, string>, existing?: Map<string, string>): void {
		this._fillWithLocalNameableKeys(m, existing)
		this.allModifiers.forEach(mod => {
			mod.system.fillWithNameableKeys(m, mod.system.nameableReplacements)
		})
	}

	protected _fillWithLocalNameableKeys(m: Map<string, string>, existing?: Map<string, string>): void {
		if (!existing) existing = this.nameableReplacements

		Nameable.extract(this.name, m, existing)
		Nameable.extract(this.notes, m, existing)
		Nameable.extract(this.userdesc, m, existing)
		if (this.rootPrereq) {
			this.rootPrereq.fillWithNameableKeys(m, existing)
		}
	}
}

interface TraitContainerData extends Omit<ModelPropsFromSchema<TraitContainerSchema>, "template_picker"> {
	template_picker: TemplatePicker
}

type TraitContainerSchema = BasicInformationTemplateSchema &
	PrereqTemplateSchema &
	ContainerTemplateSchema &
	ReplacementTemplateSchema & {
		ancestry: fields.StringField<string, string, true, false, true>
		userdesc: fields.StringField<string, string, true, false, true>
		cr: fields.NumberField<selfctrl.Roll, selfctrl.Roll, true, false, true>
		cr_adj: fields.StringField<selfctrl.Adjustment, selfctrl.Adjustment, true, false, true>
		container_type: fields.StringField<container.Type>
		disabled: fields.BooleanField
		template_picker: fields.SchemaField<TemplatePickerSchema>
	}

export { TraitContainerData, type TraitContainerSchema }
