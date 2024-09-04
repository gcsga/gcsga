import { ItemDataModel } from "@module/data/abstract.ts"
import fields = foundry.data.fields
import { Nameable } from "@module/util/nameable.ts"
import { EvalEmbeddedRegex, LocalizeGURPS, StringBuilder, display, replaceAllStringFunc } from "@util"
import { SkillLevel, addTooltipForSkillLevelAdj } from "../helpers.ts"
import { SheetSettings, Study } from "@system"
import { ItemType } from "@module/data/constants.ts"
import { ItemTemplateType } from "../types.ts"

class SpellFieldsTemplate extends ItemDataModel<SpellFieldsTemplateSchema> {
	// TODO: see if this causes issues
	declare nameableReplacements: Map<string, string>
	declare level: SkillLevel

	static override defineSchema(): SpellFieldsTemplateSchema {
		const fields = foundry.data.fields

		return {
			college: new fields.ArrayField<fields.StringField>(new foundry.data.fields.StringField()),
			power_source: new fields.StringField<string, string, true, false, true>({
				required: true,
				nullable: false,
				initial: "Arcane",
			}),
			spell_class: new fields.StringField<string, string, true, false, true>({
				required: true,
				nullable: false,
				initial: "Regular",
			}),
			resist: new fields.StringField<string, string, true, false, true>({
				required: true,
				nullable: false,
				initial: "",
			}),
			casting_cost: new fields.StringField<string, string, true, false, true>({
				required: true,
				nullable: false,
				initial: "1",
			}),
			maintenance_cost: new fields.StringField<string, string, true, false, true>({
				required: true,
				nullable: false,
				initial: "",
			}),
			casting_time: new fields.StringField<string, string, true, false, true>({
				required: true,
				nullable: false,
				initial: "1 sec",
			}),
			duration: new fields.StringField<string, string, true, false, true>({
				required: true,
				nullable: false,
				initial: "Instant",
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
	college: fields.ArrayField<fields.StringField>
	power_source: fields.StringField<string, string, true, false, true>
	spell_class: fields.StringField<string, string, true, false, true>
	resist: fields.StringField<string, string, true, false, true>
	casting_cost: fields.StringField<string, string, true, false, true>
	maintenance_cost: fields.StringField<string, string, true, false, true>
	casting_time: fields.StringField<string, string, true, false, true>
	duration: fields.StringField<string, string, true, false, true>
}

export { SpellFieldsTemplate, type SpellFieldsTemplateSchema }
