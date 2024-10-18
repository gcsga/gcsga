import { type ItemGURPS2 } from "@module/document/item.ts"
import { Nameable } from "@module/util/index.ts"
import { ErrorGURPS, StringBuilder, StringComparison, align, cell, display, feature, selfctrl } from "@util"
import { ItemDataModel } from "./abstract.ts"
import { ItemType } from "../constants.ts"
import { FeatureSet, FeatureTypes } from "../feature/types.ts"
import { SheetSettings } from "../sheet-settings.ts"
import { Study } from "../study.ts"
import { MaybePromise } from "../types.ts"
import { CellData, CellDataOptions } from "./components/cell-data.ts"
import { ItemInst, costAdjustedForModifiers } from "./helpers.ts"
import {
	BasicInformationTemplate,
	BasicInformationTemplateSchema,
	ContainerTemplate,
	ContainerTemplateSchema,
	FeatureTemplate,
	FeatureTemplateSchema,
	PrereqTemplate,
	PrereqTemplateSchema,
	ReplacementTemplate,
	ReplacementTemplateSchema,
	StudyTemplate,
	StudyTemplateSchema,
} from "./templates/index.ts"
import { ItemTemplateType } from "./types.ts"
import fields = foundry.data.fields

class TraitData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	PrereqTemplate,
	ContainerTemplate,
	FeatureTemplate,
	StudyTemplate,
	ReplacementTemplate,
) {
	static override _systemType = ItemType.Trait

	static override modifierTypes = new Set([ItemType.TraitModifier, ItemType.TraitModifierContainer])
	static override weaponTypes = new Set([ItemType.WeaponMelee, ItemType.WeaponRanged])

	override async getSheetData(context: Record<string, unknown>): Promise<void> {
		context.detailsParts = ["gurps.details-trait", "gurps.details-prereqs", "gurps.details-features"]
		context.embedsParts = ["gurps.embeds-weapon-melee", "gurps.embeds-weapon-ranged", "gurps.embeds-trait-modifier"]
	}

	static override defineSchema(): TraitSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			userdesc: new fields.StringField({
				required: true,
				nullable: false,
				initial: "",
				label: "GURPS.Item.Trait.FIELDS.UserDesc.Name",
			}),
			base_points: new fields.NumberField({
				required: true,
				nullable: false,
				integer: true,
				initial: 0,
				label: "GURPS.Item.Trait.FIELDS.BasePoints.Name",
			}),
			levels: new fields.NumberField({
				required: true,
				nullable: true,
				min: 0,
				initial: null,
				label: "GURPS.Item.Trait.FIELDS.Levels.Name",
			}),
			points_per_level: new fields.NumberField({
				required: true,
				nullable: true,
				integer: true,
				initial: null,
				label: "GURPS.Item.Trait.FIELDS.PointsPerLevel.Name",
			}),
			cr: new fields.NumberField({
				required: true,
				nullable: false,
				choices: selfctrl.RollsChoices(),
				initial: selfctrl.Roll.NoCR,
				label: "GURPS.Item.Trait.FIELDS.Cr.Name",
			}),
			cr_adj: new fields.StringField({
				required: true,
				nullable: false,
				blank: false,
				choices: selfctrl.AdjustmentsChoices(),
				initial: selfctrl.Adjustment.NoCRAdj,
				label: "GURPS.Item.Trait.FIELDS.CrAdj.Name",
			}),
			disabled: new fields.BooleanField({
				required: true,
				nullable: false,
				initial: false,
				label: "GURPS.Item.Trait.FIELDS.Disabled.Name",
			}),
			round_down: new fields.BooleanField({
				required: true,
				nullable: false,
				initial: false,
				label: "GURPS.Item.Trait.FIELDS.RoundDown.Name",
			}),
			can_level: new fields.BooleanField({
				required: true,
				nullable: false,
				initial: false,
			}),
		}) as unknown as TraitSchema
	}

	get isLeveled(): boolean {
		return this.can_level
	}

	override cellData(_options: { hash: CellDataOptions } = { hash: {} }): Record<string, CellData> {
		return {
			name: new CellData({
				type: cell.Type.Text,
				primary: this.processedName,
				secondary: this.secondaryText(display.Option.isInline),
				disabled: !this.enabled,
				unsatisfiedReason: this.unsatisfiedReason,
				tooltip: this.secondaryText(display.Option.isTooltip),
			}),
			points: new CellData({
				type: cell.Type.Text,
				primary: this.adjustedPoints.toString(),
				alignment: align.Option.End,
			}),
		}
	}

	static override _cleanData(
		source?: DeepPartial<SourceFromSchema<TraitSchema>> & { [key: string]: unknown },
		_options?: Record<string, unknown>,
	): void {
		if (source) {
			source.levels = source.can_level ? source.levels || 0 : null
			source.points_per_level = source.can_level ? source.points_per_level || 0 : null
		}
	}

	get enabled(): boolean {
		if (this.disabled) return false
		let p = this.parent
		while (p.container !== null) {
			p = p.container as ItemGURPS2
			if (p.isOfType(ItemType.TraitContainer)) {
				if (p.system.disabled) return false
			}
			throw ErrorGURPS("container of trait is not of type trait_container.")
		}
		return true
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

	/** Returns the current level of the trait or 0 if it is not leveled */
	get currentLevel(): number {
		if (this.enabled && this.can_level) return this.levels ?? 0
		return 0
	}

	/** Returns trait point cost adjusted for enablement and modifiers */
	get adjustedPoints(): MaybePromise<number> {
		if (!this.enabled) return 0
		if (this.parent.pack) return this.#adjustedPoints()
		return costAdjustedForModifiers(
			this.parent as ItemInst<ItemType.Trait>,
			this.allModifiers as Collection<ItemInst<ItemType.TraitModifier>>,
		)
	}

	async #adjustedPoints(): Promise<number> {
		return costAdjustedForModifiers(this.parent as ItemInst<ItemType.Trait>, await this.allModifiers)
	}

	get processedName(): string {
		const buffer = new StringBuilder()
		buffer.push(this.nameWithReplacements)
		if (this.can_level) {
			buffer.push(` ${(this.levels ?? 0).toString()}`)
		}
		return buffer.toString()
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
			// TODO: check if this works
			buffer.appendToNewLine(this.modifierNotes as string)
		}
		if (optionChecker(settings.notes_display)) {
			buffer.appendToNewLine(this.processedNotes)
			buffer.appendToNewLine(Study.progressText(Study.resolveHours(this), this.study_hours_needed, false))
		}
		return buffer.toString()
	}

	/** Features */
	override addFeaturesToSet(featureSet: FeatureSet): void {
		if (!this.enabled) return

		const levels = this.isLeveled ? Math.max(this.levels ?? 0) : 0
		for (const f of this.features) {
			this._addFeatureToSet(f, featureSet, levels)
		}

		const cr = this.cr
		const adj = this.cr_adj
		if (adj === selfctrl.Adjustment.MajorCostOfLivingIncrease) {
			this._addFeatureToSet(
				new FeatureTypes[feature.Type.SkillBonus](
					{
						name: { compare: StringComparison.Option.IsString, qualifier: "Merchant" },
						amount: selfctrl.Roll.penalty(cr),
					},
					{ parent: this },
				),
				featureSet,
				levels,
			)
		}
	}

	/** Replacements */
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
		this._fillWithNameableKeysFromFeatures(m, existing)
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

interface TraitData extends ModelPropsFromSchema<TraitSchema> {
	get weapons(): MaybePromise<Collection<ItemInst<ItemType.WeaponMelee | ItemType.WeaponRanged>>>
}

type TraitSchema = BasicInformationTemplateSchema &
	PrereqTemplateSchema &
	ContainerTemplateSchema &
	FeatureTemplateSchema &
	StudyTemplateSchema &
	ReplacementTemplateSchema & {
		userdesc: fields.StringField<string, string, true, false, true>
		base_points: fields.NumberField<number, number, true, false, true>
		levels: fields.NumberField<number, number, true, true, true>
		points_per_level: fields.NumberField<number, number, true, true, true>
		cr: fields.NumberField<selfctrl.Roll, selfctrl.Roll, true, false, true>
		cr_adj: fields.StringField<selfctrl.Adjustment>
		disabled: fields.BooleanField<boolean>
		round_down: fields.BooleanField<boolean>
		can_level: fields.BooleanField
	}

export { TraitData, type TraitSchema }
