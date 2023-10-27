import { StringCompare, StringComparison } from "@module/data"
import { BaseFeature } from "./base"
import { FeatureType } from "./data"

export class SkillBonus extends BaseFeature {
	selection_type!: SkillBonusSelectionType

	name?: StringCompare

	specialization?: StringCompare

	tags?: StringCompare

	static get defaults(): Record<string, any> {
		return mergeObject(super.defaults, {
			type: FeatureType.SkillBonus,
			selection_type: SkillBonusSelectionType.SkillsWithName,
			name: { compare: StringComparison.Is, qualifier: "" },
			specialization: { compare: StringComparison.None, qualifier: "" },
			tags: { compare: StringComparison.None, qualifier: "" },
		})
	}
}

export enum SkillBonusSelectionType {
	SkillsWithName = "skills_with_name",
	WeaponsWithName = "weapons_with_name",
	ThisWeapon = "this_weapon",
}
