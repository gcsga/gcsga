import { BonusOwner } from "./bonus_owner"
import { LeveledAmount, LeveledAmountObj } from "./leveled_amount"
import { StringCompareType, StringCriteria } from "@util"
import { feature, spellmatch } from "@util/enum"

export interface SpellPointBonusObj extends LeveledAmountObj {
	match: spellmatch.Type
	name: StringCriteria
	tags: StringCriteria
}

export class SpellPointBonus extends BonusOwner {
	match: spellmatch.Type

	name: StringCriteria

	tags: StringCriteria

	leveledAmount: LeveledAmount

	constructor() {
		super()
		this.type = feature.Type.SpellBonus
		this.match = spellmatch.Type.AllColleges
		this.name = new StringCriteria(StringCompareType.IsString)
		this.tags = new StringCriteria(StringCompareType.AnyString)
		this.leveledAmount = new LeveledAmount({ amount: 1 })
	}

	matchForType(name: string, powerSource: string, colleges: string[]): boolean {
		return spellmatch.Type.matchForType(this.match, this.name, name, powerSource, colleges)
	}

	toObject(): SpellPointBonusObj {
		return {
			...super.toObject(),
			match: this.match,
			name: this.name,
			tags: this.tags,
		}
	}

	static fromObject(data: SpellPointBonusObj): SpellPointBonus {
		const bonus = new SpellPointBonus()
		bonus.match = data.match
		if (data.name) bonus.name = new StringCriteria(data.name.compare, data.name.qualifier)
		if (data.tags) bonus.tags = new StringCriteria(data.tags.compare, data.tags.qualifier)
		bonus.leveledAmount = LeveledAmount.fromObject(data)
		return bonus
	}
}
