import { StringComparisonType, StringCriteria } from "@module/data"
import { BonusOwner } from "./bonus_owner"
import { FeatureType, spellmatch } from "./data"
import { LeveledAmount, LeveledAmountObj } from "./leveled_amount"
import { stringCompare } from "@util"

export interface SpellPointBonusObj extends LeveledAmountObj {
	match: spellmatch
	name: StringCriteria
	tags: StringCriteria
}

export class SpellPointBonus extends BonusOwner {
	match: spellmatch

	name: StringCriteria

	tags: StringCriteria

	leveledAmount: LeveledAmount

	constructor() {
		super()
		this.type = FeatureType.SpellBonus
		this.match = spellmatch.AllColleges
		this.name = {
			compare: StringComparisonType.IsString,
		}
		this.tags = {
			compare: StringComparisonType.AnyString,
		}
		this.leveledAmount = new LeveledAmount({ amount: 1 })
	}

	matchForType(name: string, powerSource: string, colleges: string[]): boolean {
		switch (this.match) {
			case spellmatch.AllColleges:
				return true
			case spellmatch.Name:
				return stringCompare(name, this.name)
			case spellmatch.CollegeName:
				return stringCompare(colleges, this.name)
			case spellmatch.PowerSource:
				return stringCompare(powerSource, this.name)
		}
	}
}
