import { ActorType, SkillDefaultType, ToggleableNumberField, ToggleableStringField, gid } from "@data"
import { StringBuilder } from "@util"
import { ActorGURPS2 } from "@module/documents/actor.ts"
import { ActorTemplateType } from "@module/data/actor/types.ts"
import { Nameable } from "@module/util/index.ts"
import { ItemTemplateType } from "../types.ts"
import { createButton, createDummyElement } from "@module/applications/helpers.ts"
import { getAttributeChoices } from "../../attribute/helpers.ts"
import { ItemDataModel } from "../abstract.ts"
import fields = foundry.data.fields
import { ItemGURPS2 } from "@module/documents/item.ts"
import { ReplaceableStringField } from "@module/data/fields/replaceable-string-field.ts"

const SKILL_BASED_DEFAULT_TYPES: Set<string> = new Set([gid.Skill, gid.Parry, gid.Block])

class SkillDefault extends foundry.abstract.DataModel<ItemDataModel, SkillDefaultSchema> {
	static override defineSchema(): SkillDefaultSchema {
		const fields = foundry.data.fields
		return {
			type: new ToggleableStringField({
				required: true,
				initial: gid.Dexterity,
			}),
			name: new ReplaceableStringField({ required: true, nullable: true, initial: null }),
			specialization: new ReplaceableStringField({ required: true, nullable: true, initial: null }),
			modifier: new ToggleableNumberField({ integer: true, required: true, nullable: false, initial: 0 }),
			level: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			adjusted_level: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			points: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
		}
	}

	static override cleanData(
		source: DeepPartial<SourceFromSchema<SkillDefaultSchema>> & { [key: string]: unknown },
		options?: Record<string, unknown>,
	): SourceFromSchema<SkillDefaultSchema> {
		if (source.type) {
			source.name = SKILL_BASED_DEFAULT_TYPES.has(source.type) ? source.name || "" : null
			source.specialization = SKILL_BASED_DEFAULT_TYPES.has(source.type) ? source.specialization || "" : null
		}

		return super.cleanData(source, options) as SourceFromSchema<SkillDefaultSchema>
	}

	get skillBased(): boolean {
		return SKILL_BASED_DEFAULT_TYPES.has(this.type) ?? false
	}

	get item(): ItemGURPS2 {
		return this.parent.parent
	}

	get index(): number {
		if (!this.parent.hasTemplate(ItemTemplateType.Default)) return -1
		return this.parent.defaults.indexOf(this)
	}

	get element(): Handlebars.SafeString {
		const enabled: boolean = (this.item.sheet as any).editable
		return new Handlebars.SafeString(this.toFormElement(enabled).outerHTML)
	}

	toFormElement(enabled: boolean): HTMLElement {
		const prefix = `system.study.${this.index}`

		const element = document.createElement("li")

		const replacements = this.item.hasTemplate(ItemTemplateType.Replacement)
			? this.item.system.replacements
			: new Map()

		const choices = Object.entries(
			getAttributeChoices(this.parent.actor, this.type, "GURPS.Item.Defaults.Fields.Attribute", {
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

		if (!enabled) {
			element.append(createDummyElement(`${prefix}.type`, this.type))
			element.append(createDummyElement(`${prefix}.modifier`, this.modifier))
			element.append(createDummyElement(`${prefix}.level`, this.level))
			element.append(createDummyElement(`${prefix}.adjusted_level`, this.adjusted_level))
			element.append(createDummyElement(`${prefix}.points`, this.points))

			if (this.name !== null) element.append(createDummyElement(`${prefix}.name`, this.name))
			if (this.specialization !== null)
				element.append(createDummyElement(`${prefix}.specialization`, this.specialization))
		}

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
				disabled: !enabled,
			}),
		)

		rowElement.append(
			foundry.applications.fields.createSelectInput({
				name: enabled ? `${prefix}.type` : "",
				value: this.type,
				localize: true,
				options: choices,
				disabled: !enabled,
			}),
		)

		rowElement.append(
			this.schema.fields.name.toInput({
				name: enabled ? `${prefix}.name` : "",
				value: this.name ?? "",
				localize: true,
				placeholder: game.i18n.localize("GURPS.Item.Defaults.ToggleableName"),
				disabled: !SKILL_BASED_DEFAULT_TYPES.has(this.type),
				replacements,
			}) as HTMLElement,
		)

		rowElement.append(
			this.schema.fields.specialization.toInput({
				name: enabled ? `${prefix}.specialization` : "",
				value: this.specialization ?? "",
				localize: true,
				placeholder: game.i18n.localize("GURPS.Item.Defaults.ToggleableSpecialization"),
				disabled: !SKILL_BASED_DEFAULT_TYPES.has(this.type),
				replacements,
			}) as HTMLElement,
		)

		rowElement.append(
			this.schema.fields.modifier.toInput({
				name: enabled ? `${prefix}.modifier` : "",
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
			if (this.type === gid.Dodge) buffer.push(game.i18n.localize("GURPS.Attribute.Dodge"))
			else if (this.type === gid.Parry) buffer.push(game.i18n.localize("GURPS.Attribute.Parry"))
			else if (this.type === gid.Block) buffer.push(game.i18n.localize("GURPS.Attribute.Block"))
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
				level = actor.system.encumbrance.currentLevel.dodge
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

interface SkillDefault
	extends foundry.abstract.DataModel<ItemDataModel, SkillDefaultSchema>,
		ModelPropsFromSchema<SkillDefaultSchema> {}

type SkillDefaultSchema = {
	type: ToggleableStringField<SkillDefaultType, SkillDefaultType, true, false, true>
	name: ReplaceableStringField<string, string, true, true, true>
	specialization: ReplaceableStringField<string, string, true, true, true>
	modifier: ToggleableNumberField<number, number, true, false, true>
	level: fields.NumberField<number, number, true, false, true>
	adjusted_level: fields.NumberField<number, number, true, false, true>
	points: fields.NumberField<number, number, true, false, true>
}

export { SkillDefault, type SkillDefaultSchema }
