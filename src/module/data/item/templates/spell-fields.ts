import { ItemDataModel } from "@module/data/abstract.ts"
import fields = foundry.data.fields
import {
	ErrorGURPS,
	EvalEmbeddedRegex,
	LocalizeGURPS,
	StringBuilder,
	TooltipGURPS,
	align,
	cell,
	display,
	replaceAllStringFunc,
} from "@util"
import { SkillLevel, addTooltipForSkillLevelAdj, formatRelativeSkill } from "../helpers.ts"
import { ItemType } from "@module/data/constants.ts"
import { ItemTemplateType } from "../types.ts"
import { CellData } from "../compontents/cell-data.ts"
import { SheetSettings } from "@module/data/sheet-settings.ts"
import { Study } from "@module/data/study.ts"
import { Nameable } from "@module/util/index.ts"
import { StringArrayField } from "../fields/string-array-field.ts"

class SpellFieldsTemplate extends ItemDataModel<SpellFieldsTemplateSchema> {
	// TODO: see if this causes issues
	declare nameableReplacements: Map<string, string>
	declare level: SkillLevel

	static override defineSchema(): SpellFieldsTemplateSchema {
		const fields = foundry.data.fields

		return {
			college: new StringArrayField({
				required: true,
				nullable: false,
				initial: [],
				label: "GURPS.Item.Spell.FIELDS.College.Name",
			}),
			power_source: new fields.StringField<string, string, true, false, true>({
				required: true,
				nullable: false,
				initial: "Arcane",
				label: "GURPS.Item.Spell.FIELDS.PowerSource.Name",
			}),
			spell_class: new fields.StringField<string, string, true, false, true>({
				required: true,
				nullable: false,
				initial: "Regular",
				label: "GURPS.Item.Spell.FIELDS.Class.Name",
			}),
			resist: new fields.StringField<string, string, true, false, true>({
				required: true,
				nullable: false,
				initial: "",
				label: "GURPS.Item.Spell.FIELDS.Resist.Name",
			}),
			casting_cost: new fields.StringField<string, string, true, false, true>({
				required: true,
				nullable: false,
				initial: "1",
				label: "GURPS.Item.Spell.FIELDS.CastingCost.Name",
			}),
			maintenance_cost: new fields.StringField<string, string, true, false, true>({
				required: true,
				nullable: false,
				initial: "",
				label: "GURPS.Item.Spell.FIELDS.MaintenanceCost.Name",
			}),
			casting_time: new fields.StringField<string, string, true, false, true>({
				required: true,
				nullable: false,
				initial: "1 sec",
				label: "GURPS.Item.Spell.FIELDS.CastingTime.Name",
			}),
			duration: new fields.StringField<string, string, true, false, true>({
				required: true,
				nullable: false,
				initial: "Instant",
				label: "GURPS.Item.Spell.FIELDS.Duration.Name",
			}),
		}
	}

	override get cellData(): Record<string, CellData> {
		const levelTooltip = () => {
			const tooltip = new TooltipGURPS()
			const level = this.level
			if (level.tooltip === "") return ""
			tooltip.push(LocalizeGURPS.translations.GURPS.Tooltip.IncludesModifiersFrom, ":")
			tooltip.push(level.tooltip)
			return tooltip.toString()
		}

		if (!this.isOfType(ItemType.Spell, ItemType.RitualMagicSpell))
			throw ErrorGURPS("Spell field template is somehow not a spell.")

		const tooltip = new TooltipGURPS()
		const points = new CellData({
			type: cell.Type.Text,
			primary: this.adjustedPoints(tooltip),
			align: align.Option.End,
		})
		if (tooltip.length !== 0) {
			const pointsTooltip = new TooltipGURPS()
			pointsTooltip.push(LocalizeGURPS.translations.GURPS.Tooltip.IncludesModifiersFrom, ":")
			pointsTooltip.push(tooltip.toString())
			points.tooltip = pointsTooltip.toString()
		}

		return {
			name: new CellData({
				type: cell.Type.Text,
				primary: this.processedName,
				secondary: this.secondaryText(display.Option.isInline),
				unsatisfiedReason: this.unsatisfiedReason,
				tooltip: this.secondaryText(display.Option.isTooltip),
			}),
			resist: new CellData({
				type: cell.Type.Text,
				primary: this.resistWithReplacements,
			}),
			class: new CellData({
				type: cell.Type.Text,
				primary: this.classWithReplacements,
			}),
			college: new CellData({
				type: cell.Type.Text,
				primary: this.collegeWithReplacements.join(", "),
			}),
			castingCost: new CellData({
				type: cell.Type.Text,
				primary: this.castingCostWithReplacements,
			}),
			maintenanceCost: new CellData({
				type: cell.Type.Text,
				primary: this.maintenanceCostWithReplacements,
			}),
			castingTime: new CellData({
				type: cell.Type.Text,
				primary: this.castingTimeWithReplacements,
			}),
			duration: new CellData({
				type: cell.Type.Text,
				primary: this.durationWithReplacements,
			}),
			difficulty: new CellData({
				type: cell.Type.Text,
				primary: this.difficulty.toString(),
			}),
			level: new CellData({
				type: cell.Type.Text,
				primary: this.levelAsString,
				tooltip: levelTooltip(),
				align: align.Option.End,
			}),
			relativeLevel: new CellData({
				type: cell.Type.Text,
				primary: formatRelativeSkill(this.actor, false, this.difficulty, this.adjustedRelativeLevel),
				tooltip: levelTooltip(),
			}),
			points,
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

	secondaryText(optionChecker: (option: display.Option) => boolean): string {
		const buffer = new StringBuilder()
		const settings = SheetSettings.for(this.parent.actor)
		if (optionChecker(settings.notes_display)) {
			buffer.appendToNewLine(this.processedNotes.trim())
			buffer.appendToNewLine(this.rituals)
			if (this.hasTemplate(ItemTemplateType.Study))
				buffer.appendToNewLine(Study.progressText(Study.resolveHours(this), this.study_hours_needed, false))
		}
		addTooltipForSkillLevelAdj(optionChecker, settings, this.level, buffer)
		return buffer.toString()
	}

	get processedNotes(): string {
		const notes = this.isOfType(ItemType.Spell, ItemType.RitualMagicSpell) ? this.notesWithReplacements : ""
		return replaceAllStringFunc(EvalEmbeddedRegex, notes, this.parent.actor)
	}

	// Displayed rituals value based on spell level
	get rituals(): string {
		if (!this.actor) return ""

		const level = this.level.level

		switch (true) {
			case level < 10:
				return LocalizeGURPS.translations.GURPS.SpellRitual.LessThan10
			case level < 15:
				return LocalizeGURPS.translations.GURPS.SpellRitual.LessThan15
			case level < 20: {
				const ritual = LocalizeGURPS.translations.GURPS.SpellRitual.LessThan15
				let time = LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.SpellRitual.Time, { number: -1 })
				if (this.classWithReplacements.toLowerCase().includes("blocking")) {
					time = ""
				}
				return LocalizeGURPS.format(ritual, { time })
			}
			default: {
				const adj = Math.trunc((level - 15) / 5)
				const spellClass = this.classWithReplacements.toLowerCase()
				let time = ""
				let cost = ""
				if (!spellClass.includes("missile")) {
					time = LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.SpellRitual.Time, { number: 1 << adj })
				}
				if (!spellClass.includes("blocking")) {
					cost = LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.SpellRitual.Cost, { number: adj + 1 })
				}
				return LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.SpellRitual.MoreThan20, { time, cost })
			}
		}
	}

	/**  Replacements */
	get powerSourceWithReplacements(): string {
		return Nameable.apply(this.power_source, this.nameableReplacements)
	}

	get classWithReplacements(): string {
		return Nameable.apply(this.spell_class, this.nameableReplacements)
	}

	get resistWithReplacements(): string {
		return Nameable.apply(this.resist, this.nameableReplacements)
	}

	get castingCostWithReplacements(): string {
		return Nameable.apply(this.casting_cost, this.nameableReplacements)
	}

	get maintenanceCostWithReplacements(): string {
		return Nameable.apply(this.maintenance_cost, this.nameableReplacements)
	}

	get castingTimeWithReplacements(): string {
		return Nameable.apply(this.casting_time, this.nameableReplacements)
	}

	get durationWithReplacements(): string {
		return Nameable.apply(this.duration, this.nameableReplacements)
	}

	get collegeWithReplacements(): string[] {
		return Nameable.applyToList(this.college, this.nameableReplacements)
	}
}

interface SpellFieldsTemplate extends ModelPropsFromSchema<SpellFieldsTemplateSchema> {}

type SpellFieldsTemplateSchema = {
	college: StringArrayField<true, false, true>
	power_source: fields.StringField<string, string, true, false, true>
	spell_class: fields.StringField<string, string, true, false, true>
	resist: fields.StringField<string, string, true, false, true>
	casting_cost: fields.StringField<string, string, true, false, true>
	maintenance_cost: fields.StringField<string, string, true, false, true>
	casting_time: fields.StringField<string, string, true, false, true>
	duration: fields.StringField<string, string, true, false, true>
}

export { SpellFieldsTemplate, type SpellFieldsTemplateSchema }
