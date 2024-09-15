import { ItemDataModel } from "../abstract.ts"
import fields = foundry.data.fields
import { PrereqTemplate, PrereqTemplateSchema } from "./templates/prereqs.ts"
import { ContainerTemplate, ContainerTemplateSchema } from "./templates/container.ts"
import { FeatureTemplate, FeatureTemplateSchema } from "./templates/features.ts"
import { StudyTemplate, StudyTemplateSchema } from "./templates/study.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import { ActorType, ItemType } from "../constants.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { AbstractSkillTemplate, AbstractSkillTemplateSchema } from "./templates/abstract-skill.ts"
import { LocalizeGURPS, StringBuilder, TooltipGURPS, align, cell, difficulty, display } from "@util"
import { SkillLevel, addTooltipForSkillLevelAdj, calculateTechniqueLevel, formatRelativeSkill } from "./helpers.ts"
import { ActorTemplateType } from "../actor/types.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { SkillData } from "./index.ts"
import { AttributeDifficulty } from "./fields/attribute-difficulty.ts"
import { CellData } from "./fields/cell-data.ts"
import { SkillDefault, SkillDefaultSchema } from "../skill-default.ts"
import { SheetSettings } from "../sheet-settings.ts"
import { Study } from "../study.ts"

class TechniqueData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	PrereqTemplate,
	ContainerTemplate,
	FeatureTemplate,
	StudyTemplate,
	ReplacementTemplate,
	AbstractSkillTemplate,
) {
	static override weaponTypes = new Set([ItemType.WeaponMelee, ItemType.WeaponRanged])

	static override defineSchema(): TechniqueSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			difficulty: new fields.SchemaField(AttributeDifficulty.defineSchema(), {
				initial: {
					// TODO: review
					attribute: "",
					difficulty: difficulty.Level.Hard,
				},
			}),
			default: new fields.SchemaField(SkillDefault.defineSchema(), {
				required: true,
				nullable: true,
			}),
			defaulted_from: new fields.SchemaField(SkillDefault.defineSchema(), {
				required: true,
				nullable: true,
			}),
			defaults: new fields.ArrayField(new fields.SchemaField(SkillDefault.defineSchema())),
			limit: new fields.NumberField({
				required: true,
				nullable: true,
				integer: true,
				initial: null,
			}),
			limited: new fields.BooleanField({
				required: true,
				nullable: false,
				initial: false,
			}),
		}) as TechniqueSchema
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

	get specialization(): string {
		return ""
	}

	secondaryText(optionChecker: (option: display.Option) => boolean): string {
		const buffer = new StringBuilder()
		const settings = SheetSettings.for(this.parent.actor)
		if (optionChecker(settings.modifiers_display)) {
			buffer.appendToNewLine(this.modifierNotes)
		}
		if (optionChecker(settings.notes_display)) {
			buffer.appendToNewLine(this.processedNotes)
			buffer.appendToNewLine(Study.progressText(Study.resolveHours(this), this.study_hours_needed, false))
		}
		addTooltipForSkillLevelAdj(optionChecker, settings, this.level, buffer)
		return buffer.toString()
	}

	get modifierNotes(): string {
		if (!this.actor) return ""
		return LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.SkillDefault, {
			name: this.default.fullName(this.actor, this.nameableReplacements),
			modifier: this.default.modifier.signedString(),
		})
	}

	get defaultSkill():
		| (ItemGURPS2 &
				({ type: ItemType.Skill; system: SkillData } | { type: ItemType.Technique; system: TechniqueData }))
		| null {
		const actor = this.actor
		if (!actor) return null
		if (!actor.isOfType(ActorType.Character)) return null
		if (!this.default) return null
		if (!this.default.skillBased) return null
		// @ts-expect-error type instantiation too deep
		return actor.system.bestSkillNamed(
			this.default.nameWithReplacements(this.nameableReplacements),
			this.default.specializationWithReplacements(this.nameableReplacements),
			true,
		)
	}

	override adjustedPoints(tooltip: TooltipGURPS | null = null, temporary = false): number {
		let points = this.points
		if (this.actor?.hasTemplate(ActorTemplateType.Features)) {
			points += this.actor.system.skillPointBonusFor(
				this.nameWithReplacements,
				this.specializationWithReplacements,
				this.tags,
				tooltip,
				temporary,
			)
			points = Math.max(points, 0)
		}
		return points
	}

	/** Calculates level, relative level, and relevant tooltip based on current state of
	 *  data. Does not transform the object.
	 */
	override calculateLevel(excludes: Set<string> = new Set()): SkillLevel {
		const def = this.default ?? new SkillDefault({}, { parent: this.parent })

		return calculateTechniqueLevel(
			this.parent.actor,
			this.nameableReplacements,
			this.nameWithReplacements,
			this.specializationWithReplacements,
			this.tags,
			def,
			this.difficulty.difficulty,
			this.points,
			true,
			this.limit,
			excludes,
		)
	}

	satisfied(tooltip: TooltipGURPS | null = null): boolean {
		if (!this.default.skillBased) return true
		const actor = this.actor
		if (!actor?.isOfType(ActorType.Character)) {
			return true
		}

		const sk = actor.system.bestSkillNamed(
			this.default.nameWithReplacements(this.nameableReplacements),
			this.default.specializationWithReplacements(this.nameableReplacements),
			false,
		)
		const satisfied = sk !== null && (sk.type === ItemType.Technique || sk.system.points > 0)
		if (!satisfied && tooltip !== null) {
			tooltip.push(LocalizeGURPS.translations.GURPS.Tooltip.Prefix)
			if (sk === null) {
				tooltip.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Prereq.Technique.Skill, {
						name: this.default.fullName(actor, this.nameableReplacements),
					}),
				)
			} else {
				tooltip.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Prereq.Technique.SkillWithPoints, {
						name: this.default.fullName(actor, this.nameableReplacements),
					}),
				)
			}
		}
		return satisfied
	}
}

interface TechniqueData
	extends Omit<
		ModelPropsFromSchema<TechniqueSchema>,
		"study" | "default" | "defaults" | "defaulted_from" | "difficulty"
	> {
	study: Study[]
	default: SkillDefault
	defaulted_from: SkillDefault
	defaults: SkillDefault[]
	difficulty: AttributeDifficulty
}

type TechniqueSchema = BasicInformationTemplateSchema &
	PrereqTemplateSchema &
	ContainerTemplateSchema &
	FeatureTemplateSchema &
	StudyTemplateSchema &
	ReplacementTemplateSchema &
	AbstractSkillTemplateSchema & {
		default: fields.SchemaField<
			SkillDefaultSchema,
			SourceFromSchema<SkillDefaultSchema>,
			ModelPropsFromSchema<SkillDefaultSchema>,
			true,
			true
		>
		defaulted_from: fields.SchemaField<
			SkillDefaultSchema,
			SourceFromSchema<SkillDefaultSchema>,
			ModelPropsFromSchema<SkillDefaultSchema>,
			true,
			true
		>
		defaults: fields.ArrayField<fields.SchemaField<SkillDefaultSchema>>
		limit: fields.NumberField<number, number, true, true, true>
		limited: fields.BooleanField<boolean, boolean, true, false, true>
	}

export { TechniqueData, type TechniqueSchema }
