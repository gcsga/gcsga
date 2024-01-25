import { spellmatch } from "@util/enum/spellmatch.ts"
import { BonusOwner } from "./bonus_owner.ts"
import { StringCompareType, StringCriteria } from "@util/string_criteria.ts"
import { feature } from "@util/enum/feature.ts"
import { LeveledAmount } from "./leveled_amount.ts"
import { SpellBonusObj } from "./data.ts"

export class SpellBonus extends BonusOwner {
	match: spellmatch.Type

	name: StringCriteria

	tags: StringCriteria

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

	override toObject(): SpellBonusObj {
		return {
			...super.toObject(),
			match: this.match,
			name: this.name,
			tags: this.tags,
		}
	}

	static fromObject(data: SpellBonusObj): SpellBonus {
		const bonus = new SpellBonus()
		bonus.match = data.match
		if (data.name) bonus.name = new StringCriteria(data.name.compare, data.name.qualifier)
		if (data.tags) bonus.tags = new StringCriteria(data.tags.compare, data.tags.qualifier)
		bonus.leveledAmount = LeveledAmount.fromObject(data)
		return bonus
	}
}
