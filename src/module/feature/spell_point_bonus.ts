import { BaseFeature } from "./base"
import { StringCompare, StringComparison } from "@module/data"
import { stringCompare } from "@util"
import { FeatureType, SpellBonusMatch } from "./data"

export class SpellPointBonus extends BaseFeature {
	match!: SpellBonusMatch

	name?: StringCompare

	tags?: StringCompare

	static get defaults(): Record<string, any> {
		return mergeObject(super.defaults, {
			type: FeatureType.SpellPointBonus,
			match: SpellBonusMatch.All,
			name: { compare: StringComparison.None, qualifier: "" },
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
