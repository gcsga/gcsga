import { ItemDataModel } from "./abstract.ts"
import fields = foundry.data.fields
import { PrereqTemplate, PrereqTemplateSchema } from "./templates/prereqs.ts"
import { ContainerTemplate, ContainerTemplateSchema } from "./templates/container.ts"
import { FeatureTemplate, FeatureTemplateSchema } from "./templates/features.ts"
import { StudyTemplate, StudyTemplateSchema } from "./templates/study.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import { ActorType, ItemType, gid } from "../constants.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { AbstractSkillTemplate, AbstractSkillTemplateSchema } from "./templates/abstract-skill.ts"
import { LocalizeGURPS, StringBuilder, TooltipGURPS, align, cell, difficulty, display } from "@util"
import {
	ItemInst,
	SkillLevel,
	addTooltipForSkillLevelAdj,
	calculateTechniqueLevel,
	formatRelativeSkill,
} from "./helpers.ts"
import { ActorTemplateType } from "../actor/types.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { CellData, CellDataOptions } from "./components/cell-data.ts"
import { SkillDefault } from "./components/skill-default.ts"
import { SheetSettings } from "../sheet-settings.ts"
import { Study } from "../study.ts"
import { SkillDefaultTemplate, SkillDefaultTemplateSchema } from "./templates/defaults.ts"
import { AttributeDifficultyField } from "./fields/attribute-difficulty-field.ts"
import { SkillDefaultField } from "./fields/skill-default-field.ts"
import { getAttributeChoices } from "../attribute/helpers.ts"
import { MaybePromise } from "../types.ts"
import { Nameable } from "@module/util/nameable.ts"

class TechniqueData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	PrereqTemplate,
	ContainerTemplate,
	FeatureTemplate,
	StudyTemplate,
	ReplacementTemplate,
	SkillDefaultTemplate,
	AbstractSkillTemplate,
) {
	static override weaponTypes = new Set([ItemType.WeaponMelee, ItemType.WeaponRanged])

	constructor(
		data?: DeepPartial<SourceFromSchema<TechniqueSchema>>,
		options?: DataModelConstructionOptions<ItemGURPS2 | null>,
	) {
		super(data, options)
		;(this.difficulty.schema as any).difficultyChoices = difficulty.LevelsChoices(
			"GURPS.AttributeDifficulty.DifficultyKey",
			[difficulty.Level.Easy, difficulty.Level.VeryHard, difficulty.Level.Wildcard],
		)
		;(this.default.schema as any).typeChoices = getAttributeChoices(
			this.parent.actor,
			this.default.type,
			"GURPS.AttributeDifficulty.AttributeKey",
			{ blank: false, ten: true, size: false, dodge: true, parry: true, block: true, skill: true },
		).choices
	}

	override async getSheetData(context: Record<string, unknown>): Promise<void> {
		context.detailsParts = [
			"gurps.details-technique",
			"gurps.details-prereqs",
			"gurps.details-features",
			"gurps.details-defaults",
		]
		context.embedsParts = ["gurps.embeds-weapon-melee", "gurps.embeds-weapon-ranged"]
	}

	static override defineSchema(): TechniqueSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			difficulty: new AttributeDifficultyField({
				initial: {
					attribute: "",
					difficulty: difficulty.Level.Average,
				},
				attributeChoices: { "": "" },
				difficultyChoices: difficulty.LevelsChoices("GURPS.AttributeDifficulty.AttributeKey", [
					difficulty.Level.Easy,
					difficulty.Level.VeryHard,
					difficulty.Level.Wildcard,
				]),
				label: "GURPS.Item.Skill.FIELDS.Difficulty.Name",
			}),
			default: new SkillDefaultField({
				required: true,
				nullable: true,
				initial: {
					type: gid.Skill,
					name: "Skill",
					specialization: "",
					modifier: 0,
					level: 0,
					adjusted_level: 0,
					points: 0,
				},
			}),
			defaulted_from: new fields.EmbeddedDataField(SkillDefault, {
				required: true,
				nullable: true,
			}),
			// defaults: new fields.ArrayField(new fields.EmbeddedDataField(SkillDefault)),
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

	override cellData(options: CellDataOptions = {}): Record<string, CellData> {
		const { type } = options
		const isSkillContainerSheet = type === ItemType.SkillContainer

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
			primary: this.adjustedPoints(tooltip).toString(),
			alignment: align.Option.End,
			classList: ["item-points"],
			condition: !isSkillContainerSheet,
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
				classList: ["item-name"],
			}),
			difficulty: new CellData({
				type: cell.Type.Text,
				primary: this.difficulty.toString(),
				classList: ["item-difficulty"],
				condition: isSkillContainerSheet,
			}),
			level: new CellData({
				type: cell.Type.Text,
				primary: this.levelAsString,
				tooltip: levelTooltip(),
				alignment: align.Option.End,
				classList: ["item-skill-level"],
				condition: !isSkillContainerSheet,
			}),
			relativeLevel: new CellData({
				type: cell.Type.Text,
				primary: formatRelativeSkill(this.actor, false, this.difficulty, this.adjustedRelativeLevel),
				tooltip: levelTooltip(),
				classList: ["item-rsl"],
				condition: !isSkillContainerSheet,
			}),
			points,
		}
	}

	static override _cleanData(
		source: DeepPartial<SourceFromSchema<TechniqueSchema>> & { [key: string]: unknown },
		_options?: Record<string, unknown>,
	): void {
		source.limit = source.limited ? source.limit || 0 : null
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
		return LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.SkillDefault.Notes, {
			name: this.default.fullName(this.actor, this.nameableReplacements),
			modifier: this.default.modifier.signedString(),
		})
	}

	get defaultSkill(): ItemInst<ItemType.Skill | ItemType.Technique> | null {
		const actor = this.actor
		if (!actor) return null
		if (!actor.isOfType(ActorType.Character)) return null
		if (!this.default) return null
		if (!this.default.skillBased) return null
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
		const def = this.default ?? new SkillDefault({})

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

	/** Namebales */
	override fillWithNameableKeys(
		m: Map<string, string>,
		existing: Map<string, string> = this.nameableReplacements,
	): void {
		super.fillWithNameableKeys(m, existing)

		Nameable.extract(this.notes, m, existing)
		Nameable.extract(this.specialization, m, existing)
		this.default.fillWithNameableKeys(m, existing)

		this._fillWithNameableKeysFromPrereqs(m, existing)
		this._fillWithNameableKeysFromFeatures(m, existing)
		this._fillWithNameableKeysFromDefaults(m, existing)
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
}

interface TechniqueData extends ModelPropsFromSchema<TechniqueSchema> {
	get weapons(): MaybePromise<Collection<ItemInst<ItemType.WeaponMelee | ItemType.WeaponRanged>>>
}

type TechniqueSchema = BasicInformationTemplateSchema &
	PrereqTemplateSchema &
	ContainerTemplateSchema &
	FeatureTemplateSchema &
	StudyTemplateSchema &
	ReplacementTemplateSchema &
	SkillDefaultTemplateSchema &
	AbstractSkillTemplateSchema & {
		default: SkillDefaultField<true, false, true>
		defaulted_from: SkillDefaultField<true, false, true>
		limit: fields.NumberField<number, number, true, true, true>
		limited: fields.BooleanField<boolean, boolean, true, false, true>
	}

export { TechniqueData, type TechniqueSchema }
