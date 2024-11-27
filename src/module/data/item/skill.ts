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
import { ErrorGURPS, StringBuilder, TooltipGURPS, align, cell, difficulty, display, encumbrance } from "@util"
import { ItemInst, SkillLevel, addTooltipForSkillLevelAdj, formatRelativeSkill } from "./helpers.ts"
import { ActorTemplateType } from "../actor/types.ts"
import { CellData, CellDataOptions } from "./components/cell-data.ts"
import { SkillDefault } from "./components/skill-default.ts"
import { SheetSettings } from "../sheet-settings.ts"
import { Study } from "../study.ts"
import { SkillDefaultTemplate, SkillDefaultTemplateSchema } from "./templates/defaults.ts"
import { ItemGURPS2 } from "@module/documents/item.ts"
import { AttributeDifficultyField } from "./fields/attribute-difficulty-field.ts"
import { getAttributeChoices } from "../stat/attribute/helpers.ts"
import { Nameable } from "@module/util/nameable.ts"
// import { MaybePromise } from "../types.ts"
import { ToggleableNumberField } from "../fields/index.ts"
import { ReplaceableStringField } from "../fields/replaceable-string-field.ts"
import { ActionTemplate, ActionTemplateSchema } from "./templates/action.ts"

class SkillData extends ItemDataModel.mixin(
	ActionTemplate,
	BasicInformationTemplate,
	PrereqTemplate,
	ContainerTemplate,
	FeatureTemplate,
	StudyTemplate,
	ReplacementTemplate,
	SkillDefaultTemplate,
	AbstractSkillTemplate,
) {
	// static override _systemType = ItemType.Skill

	// static override weaponTypes = new Set([ItemType.WeaponMelee, ItemType.WeaponRanged])

	constructor(
		data?: DeepPartial<SourceFromSchema<SkillSchema>>,
		options?: DataModelConstructionOptions<ItemGURPS2 | null>,
	) {
		super(data, options)
		;(this.difficulty.schema as any).attributeChoices = getAttributeChoices(
			this.parent.actor,
			this.difficulty.attribute,
			"GURPS.AttributeDifficulty.AttributeKey",
			{ blank: false, ten: true, size: false, dodge: false, parry: false, block: false, skill: false },
		).choices
	}

	override async getSheetData(context: Record<string, unknown>): Promise<void> {
		context.detailsParts = [
			"gurps.details-skill",
			"gurps.details-prereqs",
			"gurps.details-features",
			"gurps.details-defaults",
			"gurps.details-study",
		]
		context.embedsParts = ["gurps.embeds-attack-melee", "gurps.embeds-attack-ranged"]
	}

	static override defineSchema(): SkillSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			specialization: new ReplaceableStringField({
				required: true,
				nullable: false,
				initial: "",
				label: "GURPS.Item.Skill.FIELDS.Specialization.Name",
			}),
			difficulty: new AttributeDifficultyField({
				initial: {
					attribute: gid.Dexterity,
					difficulty: difficulty.Level.Average,
				},
				attributeChoices: getAttributeChoices(null, gid.Dexterity, "GURPS.AttributeDifficulty.AttributeKey", {
					blank: false,
					ten: true,
					size: false,
					dodge: false,
					parry: false,
					block: false,
					skill: false,
				}).choices,
				label: "GURPS.Item.Skill.FIELDS.Difficulty.Name",
			}),
			encumbrance_penalty_multiplier: new ToggleableNumberField({
				integer: true,
				min: 0,
				max: 9,
				initial: 0,
				label: "GURPS.Item.Skill.FIELDS.EncumbrancePenaltyMultiplier.Name",
			}),
			defaulted_from: new fields.EmbeddedDataField(SkillDefault, {
				required: true,
				nullable: true,
				initial: null,
			}),
		}) as SkillSchema
	}

	override cellData(options: CellDataOptions = {}): Record<string, CellData> {
		const { type } = options
		const isSkillContainerSheet = type === ItemType.SkillContainer

		const levelTooltip = () => {
			const tooltip = new TooltipGURPS()
			const level = this.level
			if (level.tooltip === "") return ""
			tooltip.push("GURPS.Tooltip.IncludesModifiersFrom", ":")
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
			pointsTooltip.push("GURPS.Tooltip.IncludesModifiersFrom", ":")
			pointsTooltip.push(tooltip.toString())
			points.tooltip = pointsTooltip.toString()
		}

		return {
			dropdown: new CellData({
				type: cell.Type.Text,
				classList: ["item-dropdown"],
			}),
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
				return game.i18n.format("GURPS.SkillDefault.Notes", {
					name: defSkill.system.processedName,
					modifier: this.defaulted_from.modifier.signedString(),
				})
			}
		}
		return ""
	}

	get defaultSkill(): ItemInst<ItemType.Skill | ItemType.Technique> | null {
		const actor = this.actor
		if (!actor) return null
		if (!actor.isOfType(ActorType.Character)) return null
		if (!this.defaulted_from) return null
		if (!this.defaulted_from.skillBased) return null
		return actor.system.bestSkillNamed(
			this.defaulted_from.nameWithReplacements(this.replacements),
			this.defaulted_from.specializationWithReplacements(this.replacements),
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
			if (def.equivalent(this.replacements, excluded) || this.inDefaultChain(def, new Set())) {
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
		let level = def.skillLevel(actor, this.replacements, true, excludes, !this.isOfType(ItemType.Technique))
		if (def.skillBased) {
			const defName = def.nameWithReplacements(this.replacements)
			const defSpec = def.specializationWithReplacements(this.replacements)
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
			def.nameWithReplacements(this.replacements),
			def.specializationWithReplacements(this.replacements),
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
		const result: SkillDefault[] = []
		for (const def of this.defaults) {
			if (actor === null || def === null || !def.skillBased) result.push(def)
			else {
				if (!actor.isOfType(ActorType.Character)) continue
				for (const one of actor.system.skillNamed(
					def.nameWithReplacements(this.replacements),
					def.specializationWithReplacements(this.replacements),
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

	/** Namebales */
	override fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string> = this.replacements): void {
		super.fillWithNameableKeys(m, existing)

		Nameable.extract(this.notes, m, existing)
		Nameable.extract(this.specialization, m, existing)

		this._fillWithNameableKeysFromPrereqs(m, existing)
		this._fillWithNameableKeysFromFeatures(m, existing)
		this._fillWithNameableKeysFromDefaults(m, existing)
		this._fillWithNameableKeysFromEmbeds(m, existing)
	}

	protected _fillWithNameableKeysFromEmbeds(m: Map<string, string>, existing: Map<string, string>): void {
		const attacks = this.attacks

		for (const attack of attacks) {
			attack.fillWithNameableKeys(m, existing)
		}
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
		if (!actor) return { level: 0, relativeLevel: 0, tooltip: "" }
		if (actor && !actor.isOfType(ActorType.Character)) {
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
							game.i18n.format("GURPS.Tooltip.SkillEncumbrance", {
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

interface SkillData extends ModelPropsFromSchema<SkillSchema> {
	// get weapons(): MaybePromise<Collection<ItemInst<ItemType.WeaponMelee | ItemType.WeaponRanged>>>
}

type SkillSchema = ActionTemplateSchema &
	BasicInformationTemplateSchema &
	PrereqTemplateSchema &
	ContainerTemplateSchema &
	FeatureTemplateSchema &
	StudyTemplateSchema &
	ReplacementTemplateSchema &
	SkillDefaultTemplateSchema &
	AbstractSkillTemplateSchema & {
		specialization: ReplaceableStringField<string, string, true, false, true>
		encumbrance_penalty_multiplier: ToggleableNumberField<number, number, true, false, true>
		defaulted_from: fields.EmbeddedDataField<SkillDefault, true, true, true>
		// defaults: fields.ArrayField<fields.EmbeddedDataField<SkillDefault>>
	}

export { SkillData, type SkillSchema }
