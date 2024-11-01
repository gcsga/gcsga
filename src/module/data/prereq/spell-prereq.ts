import { prereq } from "@util/enum/prereq.ts"
import fields = foundry.data.fields
import { BasePrereq, BasePrereqSchema } from "./base-prereq.ts"
import { spellcmp } from "@util/enum/spellcmp.ts"
import { ActorType, ItemType } from "@data"
import { LocalizeGURPS, NumericComparison, StringComparison, TooltipGURPS } from "@util"
import { Nameable } from "@module/util/index.ts"
import { ItemGURPS2 } from "@module/documents/item.ts"
import { ActorInst } from "../actor/helpers.ts"
import { NumericCriteriaField } from "../item/fields/numeric-criteria-field.ts"
import { StringCriteriaField } from "../item/fields/string-criteria-field.ts"
import { createButton, createDummyElement } from "@module/applications/helpers.ts"

class SpellPrereq extends BasePrereq<SpellPrereqSchema> {
	static override TYPE = prereq.Type.Spell

	static override defineSchema(): SpellPrereqSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			sub_type: new fields.StringField({
				required: true,
				nullable: false,
				choices: spellcmp.TypesChoices,
				initial: spellcmp.Type.Name,
			}),
			quantity: new NumericCriteriaField({
				required: true,
				nullable: false,
				choices: {
					[NumericComparison.Option.EqualsNumber]: game.i18n.localize(
						"GURPS.Item.Prereqs.FIELDS.Quantity.Equals",
					),
					[NumericComparison.Option.AtLeastNumber]: game.i18n.localize(
						"GURPS.Item.Prereqs.FIELDS.Quantity.AtLeast",
					),
					[NumericComparison.Option.AtMostNumber]: game.i18n.localize(
						"GURPS.Item.Prereqs.FIELDS.Quantity.AtMost",
					),
				},
				initial: {
					compare: NumericComparison.Option.AtLeastNumber,
					qualifier: 0,
				},
			}),
			qualifier: new StringCriteriaField({
				required: true,
				nullable: false,
				choices: StringComparison.OptionsChoices,
				initial: {
					compare: StringComparison.Option.IsString,
					qualifier: "",
				},
			}),
		}
	}

	satisfied(actor: ActorInst<ActorType.Character>, exclude: unknown, tooltip: TooltipGURPS | null): boolean {
		let replacements = new Map<string, string>()
		if (Nameable.isAccesser(exclude)) replacements = exclude.nameableReplacements
		let techLevel: string | null = null
		if (exclude instanceof ItemGURPS2 && exclude.isOfType(ItemType.Spell, ItemType.RitualMagicSpell))
			techLevel = exclude.system.tech_level
		let count = 0
		const colleges = new Set<string>()
		for (const sp of actor.itemCollections.spells) {
			if (sp.isOfType(ItemType.SpellContainer)) continue
			if (exclude === sp || sp.system.points === 0) continue
			if (techLevel !== "" && sp.system.tech_level !== "" && techLevel !== sp.system.tech_level) continue

			switch (this.sub_type) {
				case spellcmp.Type.Name:
					if (this.qualifier.matches(replacements, sp.system.nameWithReplacements)) count += 1
					break
				case spellcmp.Type.Tag:
					if (this.qualifier.matchesList(replacements, ...sp.system.tags)) count += 1
					break
				case spellcmp.Type.College:
					if (this.qualifier.matchesList(replacements, ...sp.system.collegeWithReplacements)) count += 1
					break
				case spellcmp.Type.CollegeCount:
					for (const one of sp.system.collegeWithReplacements) {
						colleges.add(one)
					}
					break
				case spellcmp.Type.Any:
					count += 1
			}
		}
		if (this.sub_type === spellcmp.Type.CollegeCount) count = colleges.size
		let satisfied = this.quantity.matches(count)
		if (!this.has) satisfied = !satisfied

		if (!satisfied && tooltip !== null) {
			tooltip.push(LocalizeGURPS.translations.GURPS.Tooltip.Prefix)
			const spellText =
				this.quantity.qualifier === 1
					? LocalizeGURPS.translations.GURPS.Prereq.Spell.SpellSingular
					: LocalizeGURPS.translations.GURPS.Prereq.Spell.SpellPlural
			const qualifier = (() => {
				switch (this.sub_type) {
					case spellcmp.Type.Any:
						return LocalizeGURPS.translations.GURPS.Prereq.Spell.Any
					case spellcmp.Type.CollegeCount:
						return LocalizeGURPS.translations.GURPS.Prereq.Spell.CollegeCount
					case spellcmp.Type.Name:
						return LocalizeGURPS.translations.GURPS.Prereq.Spell.Name
					case spellcmp.Type.Tag:
						return LocalizeGURPS.translations.GURPS.Prereq.Spell.Tag
					case spellcmp.Type.College:
						return LocalizeGURPS.translations.GURPS.Prereq.Spell.College
					default:
						return LocalizeGURPS.translations.GURPS.Prereq.Spell.Any
				}
			})()
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Prereq.Spell.Base, {
					has: this.hasText,
					quantity: this.quantity.qualifier,
					spellText,
					qualifier: LocalizeGURPS.format(qualifier, { value: this.qualifier.toString(replacements) }),
				}),
			)
		}
		return satisfied
	}

	override toFormElement(enabled: boolean): HTMLElement {
		const prefix = `system.prereqs.${this.index}`

		const element = document.createElement("li")
		element.classList.add("prereq")

		element.append(createDummyElement(`${prefix}.id`, this.id))
		if (!enabled) {
			element.append(createDummyElement(`${prefix}.type`, this.type))
			element.append(createDummyElement(`${prefix}.sub_type`, this.sub_type))
			element.append(createDummyElement(`${prefix}.quantity.compare`, this.quantity.compare))
			element.append(createDummyElement(`${prefix}.quantity.qualifier`, this.quantity.qualifier))
			element.append(createDummyElement(`${prefix}.qualifier.compare`, this.qualifier.compare))
			element.append(createDummyElement(`${prefix}.qualifier.qualifier`, this.qualifier.qualifier))
		}

		// Quantity
		const rowElement1 = document.createElement("div")
		rowElement1.classList.add("form-fields", "secondary")
		rowElement1.append(
			createButton({
				icon: ["fa-regular", "fa-trash"],
				label: "",
				data: {
					action: "deletePrereq",
					id: this.id,
				},
				disabled: !enabled,
			}),
		)
		rowElement1.append(
			(this.schema.fields as any).has.toInput({
				name: `${prefix}.has`,
				value: (this as any).has,
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)
		rowElement1.append(
			this.schema.fields.quantity.fields.compare.toInput({
				name: `${prefix}.quantity.compare`,
				value: this.quantity.compare,
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)
		rowElement1.append(
			this.schema.fields.quantity.fields.qualifier.toInput({
				name: `${prefix}.quantity.qualifier`,
				value: this.quantity.qualifier.toString(),
				disabled: !enabled,
			}) as HTMLElement,
		)
		const typeField = this.schema.fields.type
		;(typeField as any).choices = prereq.TypesWithoutListChoices
		rowElement1.append(
			typeField.toInput({
				name: `${prefix}.type`,
				value: this.type,
				dataset: {
					selector: "prereq-type",
					index: this.index.toString(),
				},
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)
		element.append(rowElement1)

		// Qualifier
		const rowElement2 = document.createElement("div")
		rowElement2.classList.add("form-fields", "secondary")
		rowElement2.append(
			this.schema.fields.sub_type.toInput({
				name: `${prefix}.sub_type`,
				value: this.sub_type,
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)
		rowElement2.append(
			this.schema.fields.qualifier.fields.compare.toInput({
				name: `${prefix}.qualifier.compare`,
				value: this.qualifier.compare,
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)
		rowElement2.append(
			this.schema.fields.qualifier.fields.qualifier.toInput({
				name: `${prefix}.qualifier.qualifier`,
				value: this.qualifier.qualifier,
				disabled: !enabled,
			}) as HTMLElement,
		)
		element.append(rowElement2)

		return element
	}

	fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void {
		if (
			this.sub_type === spellcmp.Type.Name ||
			this.sub_type === spellcmp.Type.Tag ||
			this.sub_type === spellcmp.Type.College
		) {
			Nameable.extract(this.qualifier.qualifier, m, existing)
		}
	}
}

interface SpellPrereq extends BasePrereq<SpellPrereqSchema>, ModelPropsFromSchema<SpellPrereqSchema> {}

export type SpellPrereqSchema = BasePrereqSchema & {
	sub_type: fields.StringField<spellcmp.Type, spellcmp.Type, true, false, true>
	quantity: NumericCriteriaField<true, false, true>
	qualifier: StringCriteriaField<true, false, true>
}
export { SpellPrereq }
