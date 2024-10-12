import { ItemDataModel } from "@module/data/item/abstract.ts"
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
import { ItemInst, addTooltipForSkillLevelAdj, formatRelativeSkill } from "../helpers.ts"
import { ItemType } from "@module/data/constants.ts"
import { ItemTemplateType } from "../types.ts"
import { CellData } from "../components/cell-data.ts"
import { SheetSettings } from "@module/data/sheet-settings.ts"
import { Study } from "@module/data/study.ts"
import { Nameable } from "@module/util/index.ts"
import { StringArrayField } from "../fields/string-array-field.ts"
import { AbstractSkillTemplate, AbstractSkillTemplateSchema } from "./abstract-skill.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./basic-information.ts"
import { ContainerTemplate, ContainerTemplateSchema } from "./container.ts"
import { PrereqTemplate, PrereqTemplateSchema } from "./prereqs.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./replacements.ts"
import { StudyTemplate, StudyTemplateSchema } from "./study.ts"
import { ActorTemplateType } from "@module/data/actor/types.ts"
import { MaybePromise } from "@module/data/types.ts"

class SpellTemplate extends ItemDataModel.mixin(
	BasicInformationTemplate,
	PrereqTemplate,
	ContainerTemplate,
	StudyTemplate,
	ReplacementTemplate,
	AbstractSkillTemplate,
) {
	// TODO: see if this causes issues
	static override defineSchema(): SpellTemplateSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
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
		}) as SpellTemplateSchema
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
			primary: this.adjustedPoints(tooltip).toString(),
			alignment: align.Option.End,
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
				alignment: align.Option.End,
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

	override get processedName(): string {
		const buffer = new StringBuilder()
		buffer.push(this.nameWithReplacements)
		if (this.tech_level_required)
			buffer.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.TechLevelShort, { level: this.tech_level }),
			)
		return buffer.toString()
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

	override get processedNotes(): string {
		const notes = this.isOfType(ItemType.Spell, ItemType.RitualMagicSpell) ? this.notesWithReplacements : ""
		return replaceAllStringFunc(EvalEmbeddedRegex, notes, this.parent.actor)
	}

	override adjustedPoints(tooltip: TooltipGURPS | null = null, temporary = false): number {
		let points = this.points
		if (this.actor?.hasTemplate(ActorTemplateType.Features)) {
			points += this.actor.system.spellPointBonusFor(
				this.nameWithReplacements,
				this.powerSourceWithReplacements,
				this.collegeWithReplacements,
				this.tags,
				tooltip,
				temporary,
			)
			points = Math.max(points, 0)
		}
		return points
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

	/** Nameables */
	override fillWithNameableKeys(
		m: Map<string, string>,
		existing: Map<string, string> = this.nameableReplacements,
	): void {
		super.fillWithNameableKeys(m, existing)

		Nameable.extract(this.notes, m, existing)
		Nameable.extract(this.power_source, m, existing)
		Nameable.extract(this.spell_class, m, existing)
		Nameable.extract(this.resist, m, existing)
		Nameable.extract(this.casting_cost, m, existing)
		Nameable.extract(this.maintenance_cost, m, existing)
		Nameable.extract(this.casting_time, m, existing)
		Nameable.extract(this.duration, m, existing)

		this._fillWithNameableKeysFromPrereqs(m, existing)
		this._fillWithNameableKeysFromEmbeds(m, existing)
	}

	protected async _fillWithNameableKeysFromEmbeds(
		m: Map<string, string>,
		existing: Map<string, string>,
	): Promise<void> {
		const weapons = await this.weapons

		for (const weapon of weapons) {
			weapon.system.fillWithNameableKeys(m, existing)
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

interface SpellTemplate extends ModelPropsFromSchema<SpellTemplateSchema> {
	get weapons(): MaybePromise<Collection<ItemInst<ItemType.WeaponMelee | ItemType.WeaponRanged>>>
}

type SpellTemplateSchema = BasicInformationTemplateSchema &
	PrereqTemplateSchema &
	ContainerTemplateSchema &
	StudyTemplateSchema &
	ReplacementTemplateSchema &
	AbstractSkillTemplateSchema & {
		college: StringArrayField<true, false, true>
		power_source: fields.StringField<string, string, true, false, true>
		spell_class: fields.StringField<string, string, true, false, true>
		resist: fields.StringField<string, string, true, false, true>
		casting_cost: fields.StringField<string, string, true, false, true>
		maintenance_cost: fields.StringField<string, string, true, false, true>
		casting_time: fields.StringField<string, string, true, false, true>
		duration: fields.StringField<string, string, true, false, true>
	}

export { SpellTemplate, type SpellTemplateSchema }
