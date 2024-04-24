import { ActorGURPS } from "@actor"
import { AbstractSkillGURPS } from "@item"
import { SpellSource, SpellSystemData } from "./data.ts"
import { SkillLevel } from "@item/skill/data.ts"
import { LocalizeGURPS, NewLineRegex, StringBuilder, TooltipGURPS, difficulty, display, study } from "@util"
import { sheetSettingsFor } from "@module/data/sheet-settings.ts"
import { PrereqList, Study, resolveStudyHours, studyHoursProgressText } from "@system"
import { ActorType, ItemType, gid } from "@module/data/constants.ts"
import { SkillDifficulty } from "@module/data/types.ts"

const fields = foundry.data.fields

class SpellGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractSkillGURPS<TParent> {
	static override defineSchema(): foundry.documents.ItemSchema<string, object> {
		return this.mergeSchema(super.defineSchema(), {
			system: new fields.SchemaField({
				type: new fields.StringField({ required: true, initial: ItemType.Spell }),
				name: new fields.StringField({
					required: true,
					initial: LocalizeGURPS.translations.TYPES.Item[ItemType.Spell],
				}),
				reference: new fields.StringField(),
				reference_highlight: new fields.StringField(),
				notes: new fields.StringField(),
				vtt_notes: new fields.StringField(),
				tags: new fields.ArrayField(new foundry.data.fields.StringField()),
				tech_level: new fields.StringField(),
				tech_level_required: new fields.BooleanField(),
				difficulty: new fields.StringField<SkillDifficulty>({
					initial: `${gid.Intelligence}/${difficulty.Level.Hard}`,
				}),
				college: new fields.ArrayField(new foundry.data.fields.StringField()),
				power_source: new fields.StringField({ initial: "Arcane" }),
				spell_class: new fields.StringField({ initial: "Regular" }),
				resist: new fields.StringField(),
				casting_cost: new fields.StringField({ initial: "1" }),
				maintenance_cost: new fields.StringField(),
				casting_time: new fields.StringField({ initial: "1 sec" }),
				duration: new fields.StringField({ initial: "Instant" }),
				points: new fields.NumberField({ min: 0, integer: true, initial: 1 }),
				prereqs: new fields.SchemaField(PrereqList.defineSchema()),
				study: new fields.ArrayField(new fields.ObjectField<Study>()),
				study_hours_needed: new fields.StringField<study.Level>({
					choices: study.Levels,
					initial: study.Level.Standard,
				}),
			}),
		})
	}

	override secondaryText(optionChecker: (option: display.Option) => boolean): string {
		const buffer = new StringBuilder()
		const settings = sheetSettingsFor(this.actor)
		if (optionChecker(settings.notes_display)) {
			buffer.appendToNewLine(this.notes.trim())
			buffer.appendToNewLine(this.rituals)
			buffer.appendToNewLine(
				studyHoursProgressText(resolveStudyHours(this.system.study), this.system.study_hours_needed, false),
			)
		}
		if (optionChecker(settings.skill_level_adj_display)) {
			if (
				this.level.tooltip.length !== 0 &&
				!this.level.tooltip.includes(LocalizeGURPS.translations.gurps.common.no_additional_modifiers)
			) {
				let levelTooltip = this.level.tooltip.string.trim().replaceAll(NewLineRegex, ", ")
				const msg = LocalizeGURPS.translations.gurps.common.includes_modifiers_from
				if (levelTooltip.startsWith(`${msg},`)) levelTooltip = `${msg}:${levelTooltip.slice(msg.length + 1)}`
				buffer.appendToNewLine(levelTooltip)
			}
		}
		return buffer.toString()
	}

	get college(): string[] {
		return this.system.college
	}

	get powerSource(): string {
		return this.system.power_source
	}

	get rituals(): string {
		if (!this.actor) return ""
		const level = this.level?.level ?? 0
		switch (true) {
			case level < 10:
				return LocalizeGURPS.translations.gurps.ritual.sub_10
			case level < 15:
				return LocalizeGURPS.translations.gurps.ritual.sub_15
			case level < 20: {
				let ritual = LocalizeGURPS.translations.gurps.ritual.sub_20
				// TODO: localization
				if (this.system.spell_class.toLowerCase() === "blocking") return ritual
				ritual += LocalizeGURPS.format(LocalizeGURPS.translations.gurps.ritual.cost, {
					adj: 1,
				})
				return ritual
			}
			default: {
				const adj = Math.trunc((level - 15) / 5)
				const spellClass = this.system.spell_class.toLowerCase()
				let time = ""
				if (!spellClass.includes("missile"))
					time = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.ritual.time, {
						adj: Math.pow(2, adj),
					})
				let cost = ""
				if (!spellClass.includes("blocking")) {
					cost = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.ritual.cost, {
						adj: adj + 1,
					})
				}
				return LocalizeGURPS.translations.gurps.ritual.none + time + cost
			}
		}
	}

	adjustedPoints(tooltip?: TooltipGURPS): number {
		let points = this.points
		if (this.actor?.isOfType(ActorType.Character)) {
			points += this.actor.spellPointBonusesFor(
				this.name!,
				this.system.power_source,
				this.system.college,
				this.tags,
				tooltip,
			)
			points = Math.max(points, 0)
		}
		return points
	}

	calculateLevel(): SkillLevel {
		const none = { level: Number.MIN_SAFE_INTEGER, relativeLevel: 0, tooltip: new TooltipGURPS() }
		const actor = this.dummyActor || this.actor
		if (!actor) return none
		if (actor instanceof ActorGURPS && actor.isOfType(ActorType.Character)) {
			const tooltip = new TooltipGURPS()
			let relativeLevel = difficulty.Level.baseRelativeLevel(this.difficulty)
			let level = actor.resolveAttributeCurrent(this.attribute)
			let points = Math.trunc(this.points)
			level = actor.resolveAttributeCurrent(this.attribute)
			if (this.difficulty === difficulty.Level.Wildcard) points = Math.trunc(points / 3)
			switch (true) {
				case points === 1:
					// relativeLevel is preset to this point value
					break
				case points > 1 && points < 4:
					relativeLevel += 1
					break
				case points >= 4:
					relativeLevel += 1 + Math.floor(points / 4)
					break
				default:
					level = Number.MIN_SAFE_INTEGER
					relativeLevel = 0
			}
			if (level !== Number.MIN_SAFE_INTEGER) {
				relativeLevel += actor.spellBonusFor(
					this.name!,
					this.system.power_source,
					this.system.college,
					this.tags,
					tooltip,
				)
				relativeLevel = Math.trunc(relativeLevel)
				level += relativeLevel
			}
			return {
				level,
				relativeLevel,
				tooltip,
			}
		}
		return none
	}
}

interface SpellGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractSkillGURPS<TParent> {
	readonly _source: SpellSource
	system: SpellSystemData
}

export { SpellGURPS }
