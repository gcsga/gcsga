import { prereq } from "@util/enum/prereq.ts"
import fields = foundry.data.fields
import { BasePrereq, BasePrereqSchema } from "./base-prereq.ts"
import { spellcmp } from "@util/enum/spellcmp.ts"
import { ActorType, ItemType, NumericCompareType, StringCompareType } from "@data"
import { LocalizeGURPS, TooltipGURPS } from "@util"
import { Nameable, NumericCriteria, StringCriteria } from "@module/util/index.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { ActorInst } from "../actor/helpers.ts"

class SpellPrereq extends BasePrereq<SpellPrereqSchema> {
	static override TYPE = prereq.Type.Spell

	static override defineSchema(): SpellPrereqSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, nullable: false, blank: false, initial: prereq.Type.Spell }),
			has: new fields.BooleanField({ initial: true }),
			sub_type: new fields.StringField({ choices: spellcmp.Types, initial: spellcmp.Type.Name }),
			qualifier: new fields.EmbeddedDataField(StringCriteria, {
				required: true,
				nullable: false,
				initial: {
					compare: StringCompareType.IsString,
					qualifier: "",
				},
			}),
			quantity: new fields.EmbeddedDataField(NumericCriteria, {
				required: true,
				nullable: false,
				initial: {
					compare: NumericCompareType.AtLeastNumber,
					qualifier: 0,
				},
			}),
		}
	}

	satisfied(actor: ActorInst<ActorType.Character>, exclude: object, tooltip: TooltipGURPS | null): boolean {
		let replacements = new Map<string, string>()
		if (Nameable.isAccesser(exclude)) replacements = exclude.nameableReplacements
		let techLevel = ""
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
	has: fields.BooleanField
	sub_type: fields.StringField<spellcmp.Type>
	qualifier: fields.EmbeddedDataField<StringCriteria, true, false, true>
	quantity: fields.EmbeddedDataField<NumericCriteria, true, false, true>
}
export { SpellPrereq }
