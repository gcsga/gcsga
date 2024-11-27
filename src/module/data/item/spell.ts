import { ActorType, gid } from "../constants.ts"
import { EvalEmbeddedRegex, StringBuilder, TooltipGURPS, difficulty, replaceAllStringFunc } from "@util"
import { SkillLevel } from "./helpers.ts"
import { AttributeDifficultyField } from "./fields/attribute-difficulty-field.ts"
import { getAttributeChoices } from "../stat/attribute/helpers.ts"
import { ItemDataModel } from "./abstract.ts"
import { Nameable } from "@module/util/nameable.ts"
import { ActorTemplateType } from "../actor/types.ts"
import {
	AbstractSkillTemplate,
	AbstractSkillTemplateSchema,
	ActionTemplate,
	ActionTemplateSchema,
	BasicInformationTemplate,
	BasicInformationTemplateSchema,
	ContainerTemplate,
	ContainerTemplateSchema,
	PrereqTemplate,
	PrereqTemplateSchema,
	ReplacementTemplate,
	ReplacementTemplateSchema,
	SpellTemplate,
	SpellTemplateSchema,
	StudyTemplate,
	StudyTemplateSchema,
} from "./templates/index.ts"

class SpellData extends ItemDataModel.mixin(
	ActionTemplate,
	BasicInformationTemplate,
	PrereqTemplate,
	ContainerTemplate,
	StudyTemplate,
	ReplacementTemplate,
	AbstractSkillTemplate,
	SpellTemplate,
) {
	// static override weaponTypes = new Set([ItemType.WeaponMelee, ItemType.WeaponRanged])

	override async getSheetData(context: Record<string, unknown>): Promise<void> {
		context.detailsParts = ["gurps.details-spell", "gurps.details-prereqs", "gurps.details-study"]
		context.embedsParts = ["gurps.embeds-attack-melee", "gurps.embeds-attack-ranged"]
	}

	static override defineSchema(): SpellSchema {
		return this.mergeSchema(super.defineSchema(), {
			difficulty: new AttributeDifficultyField({
				initial: {
					attribute: gid.Intelligence,
					difficulty: difficulty.Level.Hard,
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
				label: "GURPS.Item.Spell.FIELDS.Difficulty.Name",
			}),
		}) as SpellSchema
	}

	override calculateLevel(): SkillLevel {
		const tooltip = new TooltipGURPS()
		let relativeLevel = difficulty.Level.baseRelativeLevel(this.difficulty.difficulty)
		let level = Number.MIN_SAFE_INTEGER
		if (this.actor?.isOfType(ActorType.Character)) {
			let points = Math.trunc(this.adjustedPoints())
			level = this.actor.system.resolveAttributeCurrent(this.difficulty.attribute)
			if (this.difficulty.attribute === difficulty.Level.Wildcard) {
				points = Math.trunc(points / 3)
			}
			switch (true) {
				case points < 1:
					level = Number.MIN_SAFE_INTEGER
					relativeLevel = 0
					break
				case points === 1:
					break
				case points < 4:
					relativeLevel += 1
					break
				default:
					relativeLevel += 1 + Math.trunc(points / 4)
			}
			if (level !== Number.MIN_SAFE_INTEGER) {
				relativeLevel += this.actor.system.spellBonusFor(
					this.nameWithReplacements,
					this.powerSourceWithReplacements,
					this.collegeWithReplacements,
					this.tags,
					tooltip,
				)
				relativeLevel = Math.trunc(relativeLevel)
				level += relativeLevel
			}
		}
		return {
			level,
			relativeLevel,
			tooltip: tooltip.toString(),
		}
	}

	override get processedName(): string {
		const buffer = new StringBuilder()
		buffer.push(this.nameWithReplacements)
		if (this.tech_level_required) buffer.push(game.i18n.format("GURPS.TechLevelShort", { level: this.tech_level }))
		return buffer.toString()
	}

	override get processedNotes(): string {
		return replaceAllStringFunc(EvalEmbeddedRegex, this.notesWithReplacements, this.parent.actor)
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

	/** Nameables */
	override fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string> = this.replacements): void {
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

	protected _fillWithNameableKeysFromEmbeds(m: Map<string, string>, existing: Map<string, string>): void {
		const attacks = this.attacks

		for (const attack of attacks) {
			attack.fillWithNameableKeys(m, existing)
		}
	}
}

interface SpellData extends ModelPropsFromSchema<SpellSchema> {
	// get weapons(): MaybePromise<Collection<ItemInst<ItemType.WeaponMelee | ItemType.WeaponRanged>>>
}

type SpellSchema = ActionTemplateSchema &
	BasicInformationTemplateSchema &
	PrereqTemplateSchema &
	ContainerTemplateSchema &
	StudyTemplateSchema &
	ReplacementTemplateSchema &
	AbstractSkillTemplateSchema &
	SpellTemplateSchema
export { SpellData, type SpellSchema }
