export enum FeatureType {
	AttributeBonus = "attribute_bonus",
	ConditionalModifier = "conditional_modifier",
	DRBonus = "dr_bonus",
	ReactionBonus = "reaction_bonus",
	SkillBonus = "skill_bonus",
	SkillPointBonus = "skill_point_bonus",
	SpellBonus = "spell_bonus",
	SpellPointBonus = "spell_point_bonus",
	WeaponBonus = "weapon_bonus",
	WeaponDRDivisorBonus = "weapon_dr_divisor_bonus",
	CostReduction = "cost_reduction",
	ContaiedWeightReduction = "contained_weight_reduction",
	// ThresholdBonus = "threshold_bonus",
}

export enum SpellBonusMatch {
	All = "all_colleges",
	College = "college_name",
	Spell = "spell_name",
	PowerSource = "power_source_name",
}
export enum WeaponBonusSelectionType {
	Skill = "weapons_with_required_skill",
	Name = "weapons_with_name",
	This = "this_weapon",
}
