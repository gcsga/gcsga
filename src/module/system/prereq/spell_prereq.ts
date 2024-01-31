import { prereq } from "@util/enum/prereq.ts"
import { BasePrereq } from "./base.ts"
import { spellcmp } from "@util/enum/spellcmp.ts"
import { StringCompareType, StringCriteria } from "@util/string_criteria.ts"
import { NumericCompareType, NumericCriteria } from "@util/numeric_criteria.ts"
import { SpellPrereqObj } from "./data.ts"
import { CharacterResolver, LocalizeGURPS, LootResolver } from "@util/index.ts"
import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { SpellGURPS } from "@item/spell/document.ts"
import { RitualMagicSpellGURPS } from "@item"
import { ActorType } from "@actor"
import { ItemType } from "@item/types.ts"

export class SpellPrereq extends BasePrereq {
	override type = prereq.Type.Spell

	sub_type: spellcmp.Type

	qualifier: StringCriteria

	quantity: NumericCriteria

	constructor() {
		super(prereq.Type.Spell)
		this.sub_type = spellcmp.Type.Name
		this.qualifier = new StringCriteria(StringCompareType.IsString)
		this.quantity = new NumericCriteria(NumericCompareType.AtLeastNumber, 1)
	}

	static fromObject(data: SpellPrereqObj): SpellPrereq {
		const prereq = new SpellPrereq()
		prereq.has = data.has
		if (data.sub_type) prereq.sub_type = data.sub_type
		if (data.qualifier) prereq.qualifier = new StringCriteria(data.qualifier.compare, data.qualifier.qualifier)
		if (data.quantity) prereq.quantity = new NumericCriteria(data.quantity.compare, data.quantity.qualifier)
		return prereq
	}

	satisfied(
		actor: CharacterResolver | LootResolver,
		exclude: SpellGURPS | RitualMagicSpellGURPS,
		tooltip: TooltipGURPS,
	): boolean {
		if (actor.type === ActorType.Loot) return true
		let count = 0
		const colleges: Set<string> = new Set()
		let techLevel = ""
		if (
			exclude instanceof Item &&
			(exclude.type === ItemType.Spell || exclude.type === ItemType.RitualMagicSpell)
		) {
			techLevel = exclude.techLevel
		}
		for (const sp of actor.spells) {
			if (sp.type === ItemType.SpellContainer) continue
			if (exclude === sp || sp.points === 0) continue
			if (techLevel !== "" && sp.techLevel !== "" && techLevel !== sp.techLevel) continue
			switch (this.sub_type) {
				case spellcmp.Type.Name:
					if (this.qualifier.matches(sp.name ?? "")) count += 1
					break
				case spellcmp.Type.Tag:
					for (const one of sp.tags) {
						if (this.qualifier.matches(one ?? "")) {
							count += 1
							break
						}
					}
					break
				case spellcmp.Type.College:
					for (const one of sp.college) {
						if (this.qualifier.matches(one ?? "")) {
							count += 1
							break
						}
					}
					break
				case spellcmp.Type.CollegeCount:
					for (const one of sp.college) colleges.add(one)
					break
				case spellcmp.Type.Any:
					count += 1
			}
			if (this.sub_type === spellcmp.Type.CollegeCount) count = colleges.size
		}
		let satisfied = this.quantity.matches(count)
		if (!this.has) satisfied = !satisfied
		if (!satisfied) {
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.prefix)
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.has[this.has ? "true" : "false"])
			if (this.sub_type === spellcmp.Type.CollegeCount) {
				tooltip.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.spell[this.sub_type], {
						content: this.quantity.describe(),
					}),
				)
			} else {
				tooltip.push(this.quantity.describe())
				if (this.quantity.qualifier === 1)
					tooltip.push(
						LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.spell.singular[this.sub_type], {
							content: this.qualifier.describe(),
						}),
					)
				tooltip.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.spell.multiple[this.sub_type], {
						content: this.qualifier.describe(),
					}),
				)
			}
		}
		return satisfied
	}
}
