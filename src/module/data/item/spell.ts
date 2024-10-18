import { ActorType, ItemType, gid } from "../constants.ts"
import { EvalEmbeddedRegex, LocalizeGURPS, StringBuilder, TooltipGURPS, difficulty, replaceAllStringFunc } from "@util"
import { ItemInst, SkillLevel } from "./helpers.ts"
import { AttributeDifficultyField } from "./fields/attribute-difficulty-field.ts"
import { getAttributeChoices } from "../attribute/helpers.ts"
import { SpellTemplate, SpellTemplateSchema } from "./templates/spell.ts"
import { ItemDataModel } from "./abstract.ts"
import { AbstractSkillTemplate, AbstractSkillTemplateSchema } from "./templates/abstract-skill.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { ContainerTemplate, ContainerTemplateSchema } from "./templates/container.ts"
import { PrereqTemplate, PrereqTemplateSchema } from "./templates/prereqs.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import { StudyTemplate, StudyTemplateSchema } from "./templates/study.ts"
import { Nameable } from "@module/util/nameable.ts"
import { MaybePromise } from "../types.ts"
import { ActorTemplateType } from "../actor/types.ts"

class SpellData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	PrereqTemplate,
	ContainerTemplate,
	StudyTemplate,
	ReplacementTemplate,
	AbstractSkillTemplate,
	SpellTemplate,
) {
	static override weaponTypes = new Set([ItemType.WeaponMelee, ItemType.WeaponRanged])

	override async getSheetData(context: Record<string, unknown>): Promise<void> {
		context.detailsParts = ["gurps.details-spell", "gurps.details-prereqs"]
		context.embedsParts = ["gurps.embeds-weapon-melee", "gurps.embeds-weapon-ranged"]
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
		if (this.tech_level_required)
			buffer.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.TechLevelShort, { level: this.tech_level }),
			)
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
}

interface SpellData extends ModelPropsFromSchema<SpellSchema> {
	get weapons(): MaybePromise<Collection<ItemInst<ItemType.WeaponMelee | ItemType.WeaponRanged>>>
}

type SpellSchema = BasicInformationTemplateSchema &
	PrereqTemplateSchema &
	ContainerTemplateSchema &
	StudyTemplateSchema &
	ReplacementTemplateSchema &
	AbstractSkillTemplateSchema &
	SpellTemplateSchema
export { SpellData, type SpellSchema }
