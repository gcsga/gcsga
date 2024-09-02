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
import { SkillDefaultSchema, SkillDefault, Study, SheetSettings } from "@system"
import { AttributeDifficulty, AttributeDifficultySchema } from "./fields/attribute-difficulty.ts"
import { ErrorGURPS, LocalizeGURPS, TooltipGURPS, difficulty } from "@util"
import { SkillLevel } from "./helpers.ts"

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
				points /= 3
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

type SkillSchema = BasicInformationTemplateSchema &
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
