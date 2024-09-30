import { ActorType, SkillDefaultType, gid } from "@data"
import fields = foundry.data.fields
import { LocalizeGURPS, StringBuilder } from "@util"
import { ActorGURPS2 } from "@module/document/actor.ts"
import { ActorTemplateType } from "@module/data/actor/types.ts"
import { Nameable } from "@module/util/index.ts"
import { ItemTemplateType } from "./item/types.ts"
import { createButton } from "@module/applications/helpers.ts"
import { ItemDataModel } from "./abstract.ts"
import { getAttributeChoices } from "./attribute/helpers.ts"

const SKILL_BASED_DEFAULT_TYPES: Set<string> = new Set([gid.Skill, gid.Parry, gid.Block])

// class SkillDefault<TItem extends ItemGURPS = ItemGURPS> extends foundry.abstract.DataModel<TItem, SkillDefaultSchema> {
class SkillDefault extends foundry.abstract.DataModel<ItemDataModel, SkillDefaultSchema> {
	static override defineSchema(): SkillDefaultSchema {
		const fields = foundry.data.fields

		return {
			type: new fields.StringField({
				required: true,
				initial: gid.Dexterity,
			}),
			name: new fields.StringField({ required: true, nullable: true, initial: null }),
			specialization: new fields.StringField({ required: true, nullable: true, initial: null }),
			modifier: new fields.NumberField({ integer: true, required: true, nullable: false, initial: 0 }),
			level: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			adjusted_level: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			points: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
		}
	}

	get skillBased(): boolean {
		return SKILL_BASED_DEFAULT_TYPES.has(this.type) ?? false
	}

	get index(): number {
		if (!this.parent.hasTemplate(ItemTemplateType.Default)) return -1
		return this.parent.defaults.indexOf(this)
	}

	get element(): Handlebars.SafeString {
		return new Handlebars.SafeString(this.toFormElement().outerHTML)
	}

	toFormElement(): HTMLElement {
		const element = document.createElement("li")
		const prefix = `system.defaults.${this.index}`

		const choices = Object.entries(
			getAttributeChoices(this.parent.actor, this.type, "GURPS.Item.Defaults.FIELDS.Attribute", {
				blank: false,
				ten: true,
				size: false,
				dodge: true,
				parry: true,
				block: true,
				skill: true,
			}).choices,
		).map(([value, label]) => {
			return { value, label }
		})

		const rowElement = document.createElement("div")
		rowElement.classList.add("form-fields")

		rowElement.append(
			createButton({
				icon: ["fa-regular", "fa-trash"],
				label: "",
				data: {
					action: "deleteDefault",
					index: this.index.toString(),
				},
			}),
		)

		rowElement.append(
			foundry.applications.fields.createSelectInput({
				name: `${prefix}.type`,
				value: this.type,
				localize: true,
				options: choices,
			}),
		)

		rowElement.append(
			this.schema.fields.name.toInput({
				name: `${prefix}.name`,
				value: this.name ?? "",
				localize: true,
				placeholder: game.i18n.localize("GURPS.Item.Defaults.FIELDS.Name"),
				disabled: this.type !== gid.Skill,
			}) as HTMLElement,
		)

		rowElement.append(
			this.schema.fields.specialization.toInput({
				name: `${prefix}.specialization`,
				value: this.specialization ?? "",
				localize: true,
				placeholder: game.i18n.localize("GURPS.Item.Defaults.FIELDS.Specialization"),
				disabled: this.type !== gid.Skill,
			}) as HTMLElement,
		)

		rowElement.append(
			this.schema.fields.modifier.toInput({
				name: `${prefix}.modifier`,
				value: this.modifier.signedString(),
			}) as HTMLElement,
		)

		element.append(rowElement)

		return element
	}

	cloneWithoutLevelOrPoints(): SkillDefault {
		return this.clone({ level: 0, adjusted_level: 0, points: 0 })
	}

	equivalent(replacements: Map<string, string>, other: SkillDefault | null): boolean {
		return (
			other !== null &&
			this.type === other.type &&
			this.modifier === other.modifier &&
			this.nameWithReplacements(replacements) === other.nameWithReplacements(replacements) &&
			this.specializationWithReplacements(replacements) === other.specializationWithReplacements(replacements)
		)
	}

	fullName(actor: ActorGURPS2, replacements: Map<string, string>): string {
		if (this.skillBased) {
			const buffer = new StringBuilder()
			buffer.push(this.nameWithReplacements(replacements))
			if (this.specialization !== null && this.specialization !== "") {
				buffer.push(` (${this.specializationWithReplacements(replacements)})`)
			}
			if (this.type === gid.Dodge) buffer.push(` ${LocalizeGURPS.translations.gurps.attribute.dodge}`)
			else if (this.type === gid.Parry) buffer.push(` ${LocalizeGURPS.translations.gurps.attribute.parry}`)
			else if (this.type === gid.Block) buffer.push(` ${LocalizeGURPS.translations.gurps.attribute.block}`)
			return buffer.toString()
		}
		if (!actor.hasTemplate(ActorTemplateType.Attributes)) {
			console.error(`Actor "${actor.name}" does not contain any attributes.`)
			return ""
		}
		return actor.system.resolveAttributeName(this.type)
	}

	skillLevel(
		actor: ActorGURPS2,
		replacements: Map<string, string>,
		requirePoints: boolean,
		excludes: Set<string>,
		rule_of_20: boolean,
	): number {
		if (!actor.isOfType(ActorType.Character)) return 0
		let best = Number.MIN_SAFE_INTEGER
		switch (this.type) {
			case gid.Parry:
				best = this.best(actor, replacements, requirePoints, excludes)
				if (best !== Number.MIN_SAFE_INTEGER) best = best / 2 + 3 + actor.system.bonuses.parry.value
				return this.finalLevel(best)
			case gid.Block:
				best = this.best(actor, replacements, requirePoints, excludes)
				if (best !== Number.MIN_SAFE_INTEGER) best = best / 2 + 3 + actor.system.bonuses.block.value
				return this.finalLevel(best)
			case gid.Skill:
				return this.finalLevel(this.best(actor, replacements, requirePoints, excludes))
			default:
				return this.skillLevelFast(actor, replacements, requirePoints, excludes, rule_of_20)
		}
	}

	best(actor: ActorGURPS2, replacements: Map<string, string>, requirePoints: boolean, excludes: Set<string>): number {
		let best = Number.MIN_SAFE_INTEGER
		if (!actor.isOfType(ActorType.Character)) return best
		for (const s of actor.system.skillNamed(
			this.nameWithReplacements(replacements),
			this.specializationWithReplacements(replacements),
			requirePoints,
			excludes,
		)) {
			const level = s.system.calculateLevel().level
			if (best < level) best = level
		}
		return best
	}

	skillLevelFast(
		actor: ActorGURPS2,
		replacements: Map<string, string>,
		requirePoints: boolean,
		excludes: Set<string> = new Set(),
		rule_of_20 = false,
	): number {
		let level = 0
		let best = 0
		if (!actor.isOfType(ActorType.Character)) return 0
		switch (this.type) {
			case gid.Dodge:
				// @ts-expect-error TODO: come back and fix
				level = actor.system.encumbrance.current.dodge.normal
				if (rule_of_20 && level > 20) level = 20
				return this.finalLevel(level)
			case gid.Parry:
				best = this.bestFast(actor, replacements, requirePoints, excludes)
				if (best !== Number.MIN_SAFE_INTEGER) best = Math.floor(best / 2) + 3 + actor.system.bonuses.parry.value
				return this.finalLevel(best)
			case gid.Block:
				best = this.bestFast(actor, replacements, requirePoints, excludes)
				if (best !== Number.MIN_SAFE_INTEGER) best = Math.floor(best / 2) + 3 + actor.system.bonuses.block.value
				return this.finalLevel(best)
			case gid.Skill:
				return this.finalLevel(this.bestFast(actor, replacements, requirePoints, excludes))
			case gid.Ten:
				return this.finalLevel(10)
			default:
				level = actor.system.resolveAttributeCurrent(this.type)
				if (rule_of_20) level = Math.min(level, 20)
				return this.finalLevel(level)
		}
	}

	bestFast(
		actor: ActorGURPS2,
		replacements: Map<string, string>,
		requirePoints: boolean,
		excludes: Set<string> = new Set(),
	): number {
		let best = Number.MIN_SAFE_INTEGER
		if (!actor.isOfType(ActorType.Character)) return best
		for (const sk of actor.system.skillNamed(
			this.nameWithReplacements(replacements),
			this.specializationWithReplacements(replacements),
			requirePoints,
			excludes,
		)) {
			if (best < sk.system.level.level) best = sk.system.level.level
		}
		return best
	}

	finalLevel(level: number): number {
		if (level !== Number.MIN_SAFE_INTEGER) level += this.modifier
		return level
	}

	get noLevelOrPoints(): SkillDefault {
		return new SkillDefault({
			type: this.type,
			name: this.name,
			modifier: this.modifier,
			level: 0,
			adjusted_level: 0,
			points: 0,
		})
	}

	/**  Replacements */
	nameWithReplacements(replacements: Map<string, string>): string {
		return Nameable.apply(this.name ?? "", replacements)
	}

	specializationWithReplacements(replacements: Map<string, string>): string {
		return Nameable.apply(this.specialization ?? "", replacements)
	}

	/** Nameables */
	fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void {
		Nameable.extract(this.name ?? "", m, existing)
		Nameable.extract(this.specialization ?? "", m, existing)
	}
}

// interface SkillDefault<TItem extends ItemGURPS>
interface SkillDefault
	extends foundry.abstract.DataModel<ItemDataModel, SkillDefaultSchema>,
		ModelPropsFromSchema<SkillDefaultSchema> {}

type SkillDefaultSchema = {
	type: fields.StringField<SkillDefaultType, SkillDefaultType, true, false, true>
	name: fields.StringField<string, string, true, true, true>
	specialization: fields.StringField<string, string, true, true, true>
	modifier: fields.NumberField<number, number, true, false, true>
	level: fields.NumberField<number, number, true, false, true>
	adjusted_level: fields.NumberField<number, number, true, false, true>
	points: fields.NumberField<number, number, true, false, true>
}

export { SkillDefault, type SkillDefaultSchema }
