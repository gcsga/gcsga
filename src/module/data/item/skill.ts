import { ItemDataModel, ItemDataSchema } from "../abstract.ts"
import fields = foundry.data.fields
import { PrereqTemplate, PrereqTemplateSchema } from "./templates/prereqs.ts"
import { ContainerTemplate, ContainerTemplateSchema } from "./templates/container.ts"
import { FeatureTemplate, FeatureTemplateSchema } from "./templates/features.ts"
import { StudyTemplate, StudyTemplateSchema } from "./templates/study.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import { ActorType, ItemType } from "../constants.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { AbstractSkillTemplate, AbstractSkillTemplateSchema } from "./templates/abstract-skill.ts"
import { SkillDefaultSchema, SkillDefault, Study, SheetSettings } from "@system"
import { AttributeDifficulty, AttributeDifficultySchema } from "./fields/attribute-difficulty.ts"
import { ErrorGURPS, LocalizeGURPS, StringBuilder, TooltipGURPS, difficulty, display } from "@util"
import { SkillLevel, addTooltipForSkillLevelAdj } from "./helpers.ts"
import { ActorTemplateType } from "../actor/types.ts"
import { TechniqueData } from "./technique.ts"
import { ItemGURPS2 } from "@module/document/item.ts"

class SkillData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	PrereqTemplate,
	ContainerTemplate,
	FeatureTemplate,
	StudyTemplate,
	ReplacementTemplate,
	AbstractSkillTemplate,
) {
	static override _systemType = ItemType.Skill

	static override weaponTypes = new Set([ItemType.WeaponMelee, ItemType.WeaponRanged])

	static override defineSchema(): SkillSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			specialization: new fields.StringField({
				required: true,
				nullable: false,
				initial: "",
			}),
			difficulty: new fields.SchemaField(AttributeDifficulty.defineSchema()),
			encumbrance_penalty_multiplier: new fields.NumberField({
				integer: true,
				min: 0,
				max: 9,
				initial: 0,
			}),
			defaulted_from: new fields.SchemaField(SkillDefault.defineSchema(), {
				required: true,
				nullable: true,
				initial: null,
			}),
			defaults: new fields.ArrayField(new fields.SchemaField(SkillDefault.defineSchema())),
		}) as SkillSchema
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
		if (this.difficulty.difficulty !== difficulty.Level.Wildcard) {
			const defSkill = this.defaultSkill
			if (defSkill !== null && this.defaulted_from !== null) {
				return LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.SkillDefault, {
					name: defSkill.system.processedName,
					modifier: this.defaulted_from.modifier.signedString(),
				})
			}
		}
		return ""
	}

	get defaultSkill():
		| (ItemGURPS2 &
				({ type: ItemType.Skill; system: SkillData } | { type: ItemType.Technique; system: TechniqueData }))
		| null {
		const actor = this.actor as any
		if (!actor) return null
		if (!actor.isOfType(ActorType.Character)) return null
		if (!this.defaulted_from) return null
		if (!this.defaulted_from.skillBased) return null
		return actor.system.bestSkillNamed(
			this.defaulted_from.nameWithReplacements(this.nameableReplacements),
			this.defaulted_from.specializationWithReplacements(this.nameableReplacements),
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
	override calculateLevel(_excludes: Set<string> = new Set()): SkillLevel {
		let points = this.points
		const name = this.nameWithReplacements
		const specialization = this.specializationWithReplacements
		const def = this.defaulted_from

		const actor = this.parent.actor
		if (!actor?.isOfType(ActorType.Character)) {
			throw ErrorGURPS("Actor is not character. Functionality not implemented.")
		}

		const tooltip = new TooltipGURPS()
		let relativeLevel = difficulty.Level.baseRelativeLevel(this.difficulty.difficulty)
		let level = actor.system.resolveAttributeCurrent(this.difficulty.attribute)

		if (level !== Number.MIN_SAFE_INTEGER) {
			if (SheetSettings.for(actor).use_half_stat_defaults) {
				level = Math.trunc(level / 2) + 5
			}
			if (this.difficulty.difficulty === difficulty.Level.Wildcard) {
				points = Math.trunc(points / 3)
			} else if (def !== null && def.points > 0) {
				points += def.points
			}
			points = Math.trunc(points)
			switch (true) {
				case points === 1:
					break
				case points > 1 && points < 4:
					relativeLevel += 1
					break
				case points >= 4:
					relativeLevel += 1 + Math.trunc(points / 4)
					break
				case this.difficulty.difficulty !== difficulty.Level.Wildcard && def !== null && def.points < 0:
					relativeLevel = def.adjusted_level - level
					break
				default:
					level = Number.MIN_SAFE_INTEGER
					relativeLevel = 0
			}
			if (level !== Number.MIN_SAFE_INTEGER) {
				level += relativeLevel
				if (
					this.difficulty.difficulty !== difficulty.Level.Wildcard &&
					def !== null &&
					level < def.adjusted_level
				) {
					level = def.adjusted_level
				}
				if (actor) {
					let bonus = actor.system.skillBonusFor(name, specialization, this.tags, tooltip)
					level += bonus
					relativeLevel += bonus
					bonus = actor.system.encumbranceLevel(true).penalty * this.encumbrance_penalty_multiplier
					level += bonus
					if (bonus !== 0) {
						tooltip.push(
							LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Tooltip.skillEncumbrance, {
								amouont: bonus.signedString(),
							}),
						)
					}
				}
			}
		}
		return {
			level,
			relativeLevel,
			tooltip: tooltip.toString(),
		}
	}
}

interface SkillData extends Omit<ModelPropsFromSchema<SkillSchema>, "study" | "defaulted_from" | "defaults"> {
	study: Study[]
	defaulted_from: SkillDefault | null
	defaults: SkillDefault[]
}

type SkillSchema = ItemDataSchema &
	BasicInformationTemplateSchema &
	PrereqTemplateSchema &
	ContainerTemplateSchema &
	FeatureTemplateSchema &
	StudyTemplateSchema &
	ReplacementTemplateSchema &
	AbstractSkillTemplateSchema & {
		specialization: fields.StringField<string, string, true, false, true>
		difficulty: fields.SchemaField<AttributeDifficultySchema>
		encumbrance_penalty_multiplier: fields.NumberField<number, number, true, false, true>
		defaulted_from: fields.SchemaField<
			SkillDefaultSchema,
			SourceFromSchema<SkillDefaultSchema>,
			ModelPropsFromSchema<SkillDefaultSchema>,
			true,
			true
		>
		defaults: fields.ArrayField<fields.SchemaField<SkillDefaultSchema>>
	}

export { SkillData, type SkillSchema }
