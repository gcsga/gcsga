import { BonusOwner } from "./bonus_owner"
import { LeveledAmount, LeveledAmountKeys, LeveledAmountObj } from "./leveled_amount"
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
		const levelData: Partial<Record<keyof LeveledAmountObj, any>> = {}
		for (const key of Object.keys(data)) {
			if (LeveledAmountKeys.includes(key)) {
				levelData[key as keyof LeveledAmountObj] = data[key as keyof SpellPointBonusObj]
			} else (bonus as any)[key] = data[key as keyof SpellPointBonusObj]
		}
		bonus.leveledAmount = new LeveledAmount(levelData)
		return bonus
	}
}
