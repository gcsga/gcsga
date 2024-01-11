import { CharacterResolver, LocalizeGURPS, NumericCompareType, NumericCriteria, StringCompareType, StringCriteria } from "@util"
import { BasePrereq, BasePrereqObj } from "./base"
import { prereq, spellcmp } from "@util/enum"
import { TooltipGURPS } from "@module/tooltip"
import { ItemType } from "@module/data"

export interface SpellPrereqObj extends BasePrereqObj {
	sub_type: spellcmp.Type
	qualifier: StringCriteria
	quantity: NumericCriteria
}

export class SpellPrereq extends BasePrereq {
	type = prereq.Type.Spell

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
		if (data.sub_type)
			prereq.sub_type = data.sub_type
		if (data.qualifier)
			prereq.qualifier = new StringCriteria(data.qualifier.compare, data.qualifier.qualifier)
		if (data.quantity)
			prereq.quantity = new NumericCriteria(data.quantity.compare, data.quantity.qualifier)
		return prereq
	}

	satisfied(
		character: CharacterResolver,
		exclude: any,
		tooltip: TooltipGURPS
	): boolean {
		let count = 0
		const colleges: Set<string> = new Set()
		let techLevel = ""
		if (
			exclude instanceof Item && (
				exclude.type === ItemType.Spell ||
				exclude.type === ItemType.RitualMagicSpell
			)
		) {
			techLevel = (exclude as any).techLevel
		}
		for (const sp of character.spells as any) {
			if (sp.type === ItemType.SpellContainer) continue
			if (exclude === sp || sp.points == 0) continue
			if (techLevel !== "" && sp.techLevel !== "" && techLevel !== sp.techLevel)
				continue
			switch (this.sub_type) {
				case spellcmp.Type.Name:
					if (this.qualifier.matches(sp.name ?? "")) count++
				case spellcmp.Type.Tag:
					for (const one of sp.tags) {
						if (this.qualifier.matches(one ?? "")) {
							count++
							break
						}
					}
				case spellcmp.Type.College:
					for (const one of sp.college) {
						if (this.qualifier.matches(one ?? "")) {
							count++
							break
						}
					}
				case spellcmp.Type.CollegeCount:
					for (const one of sp.college)
						colleges.add(one)
				case spellcmp.Type.Any:
					count++
			}
			if (this.sub_type === spellcmp.Type.CollegeCount) count = colleges.size
		}
		let satisfied = this.quantity.matches(count)
		if (!this.has) satisfied = !satisfied
		if (!satisfied) {
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.prefix)
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.has[this.has ? "true" : "false"])
			if (this.sub_type === spellcmp.Type.CollegeCount) {
				tooltip.push(LocalizeGURPS.format(
					LocalizeGURPS.translations.gurps.prereq.spell[this.sub_type],
					{ content: this.quantity.describe() }
				))
			} else {
				tooltip.push(this.quantity.describe())
				if (this.quantity.qualifier == 1)
					tooltip.push(LocalizeGURPS.format(
						LocalizeGURPS.translations.gurps.prereq.spell.singular[this.sub_type],
						{ content: this.qualifier.describe() }
					))
				tooltip.push(LocalizeGURPS.format(
					LocalizeGURPS.translations.gurps.prereq.spell.multiple[this.sub_type],
					{ content: this.qualifier.describe() }
				))
			}
		}
		return satisfied
	}
}
