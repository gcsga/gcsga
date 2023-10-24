import { StringCompare, StringComparison } from "@module/data"
import { stringCompare } from "@util"
import { BaseFeature } from "./base"
import { FeatureType, SpellBonusMatch } from "./data"

export class SpellBonus extends BaseFeature {
	match!: SpellBonusMatch

	name?: StringCompare

	tags?: StringCompare

	static get defaults(): Record<string, any> {
		return mergeObject(super.defaults, {
			type: FeatureType.SpellBonus,
			match: SpellBonusMatch.All,
			name: { compare: StringComparison.Is, qualifier: "" },
			tags: { compare: StringComparison.None, qualifier: "" },
		})
	}

	matchForType(name: string, powerSource: string, colleges: string[]): boolean {
		switch (this.match) {
			case SpellBonusMatch.All:
				return true
			case SpellBonusMatch.Spell:
				return stringCompare(name, this.name)
			case SpellBonusMatch.College:
				return stringCompare(colleges, this.name)
			case SpellBonusMatch.PowerSource:
				return stringCompare(powerSource, this.name)
		}
	}
}
