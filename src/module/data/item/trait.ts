import { type ItemGURPS2 } from "@module/document/item.ts"
import { ErrorGURPS, StringBuilder, affects, align, cell, display, selfctrl, tmcost } from "@util"
import { ItemDataModel } from "../abstract.ts"
import { ItemType } from "../constants.ts"
import { CellData } from "./fields/cell-data.ts"
import { ItemInst, modifyPoints } from "./helpers.ts"
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
import fields = foundry.data.fields
import { SheetSettings } from "../sheet-settings.ts"
import { Study } from "../study.ts"
import { Nameable } from "@module/util/index.ts"

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

	static override defineSchema(): TraitSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			userdesc: new fields.StringField<string, string>(),
			base_points: new fields.NumberField<number, number, true, false>({
				required: true,
				nullable: false,
				integer: true,
				initial: 0,
			}),
			levels: new fields.NumberField<number, number, true, false, true>({
				required: true,
				nullable: false,
				min: 0,
				initial: 0,
			}),
			points_per_level: new fields.NumberField<number, number, true, false, true>({
				required: true,
				integer: true,
				nullable: false,
				initial: 0,
			}),
			cr: new fields.NumberField<selfctrl.Roll, selfctrl.Roll, true, false, true>({
				choices: selfctrl.Rolls,
				initial: selfctrl.Roll.NoCR,
				nullable: false,
			}),
			cr_adj: new fields.StringField({
				choices: selfctrl.Adjustments,
				initial: selfctrl.Adjustment.NoCRAdj,
			}),
			disabled: new fields.BooleanField<boolean>({ initial: false }),
			round_down: new fields.BooleanField<boolean>({ initial: false }),
			can_level: new fields.BooleanField<boolean>({ required: true, nullable: false, initial: false }),
		}) as unknown as TraitSchema
	}

	get isLeveled(): boolean {
		return this.can_level
	}

	override get cellData(): Record<string, CellData> {
		return {
			name: new CellData({
				type: cell.Type.Text,
				primary: this.processedName,
				secondar: this.secondaryText(display.Option.isInline),
				disabled: !this.enabled,
				unsatisfiedReason: this.unsatisfiedReason,
				tooltip: this.secondaryText(display.Option.isTooltip),
			}),
			points: new CellData({
				type: cell.Type.Text,
				primary: this.adjustedPoints.toString(),
				alignment: align.Option.End,
			}),
			tags: new CellData({
				type: cell.Type.Tags,
				primary: this.combinedTags,
			}),
			reference: new CellData({
				type: cell.Type.PageRef,
				primary: this.reference,
				secondary: this.reference_highlight === "" ? this.nameWithReplacements : this.reference_highlight,
			}),
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

	get allModifiers(): ItemInst<ItemType.TraitModifier>[] {
		let modifiers: Collection<ItemGURPS2> = new Collection()
		if (this.modifiers instanceof Promise) {
			;(async () => {
				modifiers = await this.modifiers
			})()
		} else {
			modifiers = this.modifiers
		}
		return modifiers.filter(e => e.isOfType(ItemType.TraitModifier))
	}

	/** Returns the current level of the trait or 0 if it is not leveled */
	get currentLevel(): number {
		if (this.enabled && this.can_level) return this.levels
		return 0
	}

	/** Returns trait point cost adjusted for enablement and modifiers */
	get adjustedPoints(): number {
		if (!this.enabled) return 0
		let basePoints = this.base_points
		const levels = this.can_level ? this.levels : 0
		let pointsPerLevel = this.can_level ? this.points_per_level : 0
		let [baseEnh, levelEnh, baseLim, levelLim] = [0, 0, 0, 0]
		let multiplier = selfctrl.Roll.multiplier(this.cr)
		for (const mod of this.allModifiers) {
			mod.system.trait = this.parent
			const modifier = mod.system.costModifier

			switch (mod.system.cost_type) {
				case tmcost.Type.Percentage: {
					switch (mod.system.affects) {
						case affects.Option.Total:
							if (modifier < 0) {
								baseLim += modifier
								levelLim += modifier
							} else {
								baseEnh += modifier
								levelEnh += modifier
							}
							break
						case affects.Option.BaseOnly:
							if (modifier < 0) {
								baseLim += modifier
							} else {
								baseEnh += modifier
							}
							break
						case affects.Option.LevelsOnly:
							if (modifier < 0) {
								levelLim += modifier
							} else {
								levelEnh += modifier
							}
							break
					}
					break
				}
				case tmcost.Type.Points:
					if (mod.system.affects === affects.Option.LevelsOnly) {
						if (this.can_level) pointsPerLevel += modifier
						else basePoints += modifier
					}
					break
				case tmcost.Type.Multiplier:
					multiplier *= modifier
					break
			}
		}
		let modifiedBasePoints = basePoints
		const leveledPoints = pointsPerLevel * levels
		if (baseEnh !== 0 || baseLim !== 0 || levelEnh !== 0 || levelLim !== 0) {
			if (SheetSettings.for(this.parent.actor).use_multiplicative_modifiers) {
				if (baseEnh === levelEnh && baseLim === levelLim) {
					modifiedBasePoints = modifyPoints(
						modifyPoints(modifiedBasePoints + leveledPoints, baseEnh),
						Math.max(-80, baseLim),
					)
				} else {
					modifiedBasePoints =
						modifyPoints(modifyPoints(modifiedBasePoints, baseEnh), Math.max(-80, baseLim)) +
						modifyPoints(modifyPoints(leveledPoints, levelEnh), Math.max(-80, levelLim))
				}
			} else {
				const baseMod = Math.max(-80, baseEnh + baseLim)
				const levelMod = Math.max(-80, levelEnh, levelLim)
				if (baseMod === levelMod) {
					modifiedBasePoints = modifyPoints(modifiedBasePoints + leveledPoints, baseMod)
				} else {
					modifiedBasePoints =
						modifyPoints(modifiedBasePoints, baseMod) + modifyPoints(leveledPoints, levelMod)
				}
			}
		} else {
			modifiedBasePoints += leveledPoints
		}

		return this.round_down
			? Math.floor(modifiedBasePoints * multiplier)
			: Math.ceil(modifiedBasePoints * multiplier)
	}

	get processedName(): string {
		const buffer = new StringBuilder()
		buffer.push(this.nameWithReplacements)
		if (this.can_level) {
			buffer.push(` ${this.levels.toString()}`)
		}
		return buffer.toString()
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
			buffer.appendToNewLine(Study.progressText(Study.resolveHours(this), this.study_hours_needed, false))
		}
		return buffer.toString()
	}

	/** Replacements */
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
		for (const feature of this.features) {
			feature.fillWithNameableKeys(m, existing)
		}
		;(this.weapons as Collection<ItemInst<ItemType.WeaponMelee> | ItemInst<ItemType.WeaponRanged>>).forEach(
			weapon => {
				weapon.system.fillWithNameableKeys(m, existing)
			},
		)
	}
}

interface TraitData extends Omit<ModelPropsFromSchema<TraitSchema>, "study"> {
	study: Study[]
}

type TraitSchema = BasicInformationTemplateSchema &
	PrereqTemplateSchema &
	ContainerTemplateSchema &
	FeatureTemplateSchema &
	StudyTemplateSchema &
	ReplacementTemplateSchema & {
		userdesc: fields.StringField<string, string>
		base_points: fields.NumberField<number, number, true, false, true>
		levels: fields.NumberField<number, number, true, false, true>
		points_per_level: fields.NumberField<number, number, true, false, true>
		cr: fields.NumberField<selfctrl.Roll, selfctrl.Roll, true, false, true>
		cr_adj: fields.StringField<selfctrl.Adjustment>
		disabled: fields.BooleanField<boolean>
		round_down: fields.BooleanField<boolean>
		can_level: fields.BooleanField
	}

export { TraitData, type TraitSchema }
