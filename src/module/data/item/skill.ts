import { ItemDataModel } from "../abstract.ts"
import fields = foundry.data.fields
import { PrereqTemplate, PrereqTemplateSchema } from "./templates/prereqs.ts"
import { ContainerTemplate, ContainerTemplateSchema } from "./templates/container.ts"
import { FeatureTemplate, FeatureTemplateSchema } from "./templates/features.ts"
import { StudyTemplate, StudyTemplateSchema } from "./templates/study.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import { ActorType, ItemType, gid } from "../constants.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { AbstractSkillTemplate, AbstractSkillTemplateSchema } from "./templates/abstract-skill.ts"
import { SkillDefaultSchema, SkillDefault, Study, SheetSettings } from "@system"
import { AttributeDifficulty } from "./fields/attribute-difficulty.ts"
import {
	ErrorGURPS,
	LocalizeGURPS,
	StringBuilder,
	TooltipGURPS,
	align,
	cell,
	difficulty,
	display,
	encumbrance,
} from "@util"
import { SkillLevel, addTooltipForSkillLevelAdj, formatRelativeSkill } from "./helpers.ts"
import { ActorTemplateType } from "../actor/types.ts"
import { TechniqueData } from "./technique.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { CellData } from "./fields/cell-data.ts"

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
			difficulty: new fields.SchemaField(AttributeDifficulty.defineSchema(), {
				initial: {
					attribute: gid.Dexterity,
					difficulty: difficulty.Level.Average,
				},
			}),
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

	bestDefaultWithPoints(excluded: SkillDefault | null): SkillDefault | null {
		const best = this.bestDefault(excluded)
		if (best !== null) {
			const baseLine =
				(this.actor?.hasTemplate(ActorTemplateType.Attributes)
					? this.actor?.system.resolveAttributeCurrent(this.difficulty.attribute)
					: 0) + Math.trunc(difficulty.Level.baseRelativeLevel(this.difficulty.difficulty))
			const level = Math.trunc(best.level)
			best.adjusted_level = level
			switch (true) {
				case level === baseLine:
					best.points = 1
					break
				case level === baseLine + 1:
					best.points = 1
					break
				case level > baseLine + 1:
					best.points = 4 * (level - (baseLine + 1))
					break
				default:
					best.points = -Math.max(0, level)
			}
		}
		return best
	}

	bestDefault(excluded: SkillDefault | null): SkillDefault | null {
		if (this.actor === null || this.defaults.length === 0) return null
		const excludes: Set<string> = new Set()
		excludes.add(this.processedName)
		let bestDef: SkillDefault | null = null
		let best = Number.MIN_SAFE_INTEGER
		for (const def of this.resolveToSpecificDefaults()) {
			if (def.equivalent(this.nameableReplacements, excluded) || this.inDefaultChain(def, new Set())) {
				continue
			}
			const level = this.calcSkillDefaultLevel(def, excludes)
			if (best < level) {
				best = level
				bestDef = def.cloneWithoutLevelOrPoints()
				bestDef.level = level
			}
		}
		return bestDef
	}

	calcSkillDefaultLevel(def: SkillDefault, excludes: Set<string>): number {
		const actor = this.actor
		if (actor === null || !actor.isOfType(ActorType.Character)) return 0
		let level = def.skillLevel(actor, this.nameableReplacements, true, excludes, !this.isOfType(ItemType.Technique))
		if (def.skillBased) {
			const defName = def.nameWithReplacements(this.nameableReplacements)
			const defSpec = def.specializationWithReplacements(this.nameableReplacements)
			const other = actor?.system.bestSkillNamed(defName, defSpec, true, excludes) ?? null
			if (other !== null) {
				level -= actor.system.skillBonusFor(defName, defSpec, this.tags)
			}
		}
		return level
	}

	inDefaultChain(def: SkillDefault | null, lookedAt: Set<string>): boolean {
		const actor = this.actor
		if (actor === null || def === null || !def.skillBased) return false
		if (!actor.isOfType(ActorType.Character)) return false

		for (const one of actor.system.skillNamed(
			def.nameWithReplacements(this.nameableReplacements),
			def.specializationWithReplacements(this.nameableReplacements),
			true,
			null,
		)) {
			if (one.id === this.parent.id) return true
			if (!lookedAt.has(one.id)) lookedAt.add(one.id)
			if (this.inDefaultChain(one.system.defaulted_from, lookedAt)) return true
		}
		return false
	}

	resolveToSpecificDefaults(): SkillDefault[] {
		const actor = this.actor
		let result: SkillDefault[] = []
		for (const def of this.defaults) {
			if (actor === null || def === null || !def.skillBased) result.push(def)
			else {
				if (!actor.isOfType(ActorType.Character)) continue
				for (const one of actor.system.skillNamed(
					def.nameWithReplacements(this.nameableReplacements),
					def.specializationWithReplacements(this.nameableReplacements),
					true,
					new Set([this.processedName]),
				)) {
					const local = def.clone()
					local.specialization = one.system.specialization
					result.push(local)
				}
			}
		}
		return result
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
					bonus =
						encumbrance.Level.penalty(actor.system.encumbranceLevel(true)) *
						this.encumbrance_penalty_multiplier
					level += bonus
					if (bonus !== 0) {
						tooltip.push(
							LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Tooltip.SkillEncumbrance, {
								amount: bonus.signedString(),
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

interface SkillData
	extends Omit<ModelPropsFromSchema<SkillSchema>, "study" | "defaulted_from" | "defaults" | "difficulty"> {
	study: Study[]
	defaulted_from: SkillDefault | null
	defaults: SkillDefault[]
	difficulty: AttributeDifficulty
}

type SkillSchema = BasicInformationTemplateSchema &
	PrereqTemplateSchema &
	ContainerTemplateSchema &
	FeatureTemplateSchema &
	StudyTemplateSchema &
	ReplacementTemplateSchema &
	AbstractSkillTemplateSchema & {
		specialization: fields.StringField<string, string, true, false, true>
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
