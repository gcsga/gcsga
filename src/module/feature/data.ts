export enum FeatureType {
	AttributeBonus = "attribute_bonus",
	ConditionalModifierBonus = "conditional_modifier",
	DRBonus = "dr_bonus",
	ReactionBonus = "reaction_bonus",
	SkillBonus = "skill_bonus",
	SkillPointBonus = "skill_point_bonus",
	SpellBonus = "spell_bonus",
	SpellPointBonus = "spell_point_bonus",
	WeaponBonus = "weapon_bonus",
	WeaponAccBonus = "weapon_acc_bonus",
	WeaponScopeAccBonus = "weapon_scope_acc_bonus",
	WeaponDRDivisorBonus = "weapon_dr_divisor_bonus",
	WeaponMinSTBonus = "weapon_min_st_bonus",
	WeaponMinReachBonus = "weapon_min_reach_bonus",
	WeaponMaxReachBonus = "weapon_max_reach_bonus",
	WeaponHalfDamageRangeBonus = "weapon_half_damage_range_bonus",
	WeaponMinRangeBonus = "weapon_min_range_bonus",
	WeaponMaxRangeBonus = "weapon_max_range_bonus",
	WeaponRecoilBonus = "weapon_recoil_bonus",
	WeaponBulkBonus = "weapon_bulk_bonus",
	WeaponParryBonus = "weapon_parry_bonus",
	WeaponBlockBonus = "weapon_block_bonus",
	WeaponRofMode1ShotsBonus = "weapon_rof_mode_1_shots_bonus",
	WeaponRofMode1SecondaryBonus = "weapon_rof_mode_1_secondary_bonus",
	WeaponRofMode2ShotsBonus = "weapon_rof_mode_2_shots_bonus",
	WeaponRofMode2SecondaryBonus = "weapon_rof_mode_2_secondary_bonus",
	WeaponNonChamberShotsBonus = "weapon_non_chamber_shots_bonus",
	WeaponChamberShotsBonus = "weapon_chamber_shots_bonus",
	WeaponShotDurationBonus = "weapon_shot_duration_bonus",
	WeaponReloadTimeBonus = "weapon_reload_time_bonus",
	WeaponSwitch = "weapon_switch",
	CostReduction = "cost_reduction",
	ContainedWeightReduction = "contained_weight_reduction",
	MoveBonus = "move_bonus", // custom
	// ThresholdBonus = "threshold_bonus",
}

export type WeaponBonusType =
	| FeatureType.WeaponBonus
	| FeatureType.WeaponAccBonus
	| FeatureType.WeaponScopeAccBonus
	| FeatureType.WeaponDRDivisorBonus
	| FeatureType.WeaponMinSTBonus
	| FeatureType.WeaponMinReachBonus
	| FeatureType.WeaponMaxReachBonus
	| FeatureType.WeaponHalfDamageRangeBonus
	| FeatureType.WeaponMinRangeBonus
	| FeatureType.WeaponMaxRangeBonus
	| FeatureType.WeaponRecoilBonus
	| FeatureType.WeaponBulkBonus
	| FeatureType.WeaponParryBonus
	| FeatureType.WeaponBlockBonus
	| FeatureType.WeaponRofMode1ShotsBonus
	| FeatureType.WeaponRofMode1SecondaryBonus
	| FeatureType.WeaponRofMode2ShotsBonus
	| FeatureType.WeaponRofMode2SecondaryBonus
	| FeatureType.WeaponNonChamberShotsBonus
	| FeatureType.WeaponChamberShotsBonus
	| FeatureType.WeaponShotDurationBonus
	| FeatureType.WeaponReloadTimeBonus
	| FeatureType.WeaponSwitch

export enum stlimit {
	None = "none",
	StrikingOnly = "striking_only",
	LiftingOnly = "lifting_only",
	ThrowingOnly = "throwing_only",
}

export enum MoveBonusType {
	Base = "base",
	Enhanced = "enhanced",
}

export enum spellmatch {
	AllColleges = "all_colleges",
	CollegeName = "college_name",
	PowerSource = "power_source_name",
	Name = "spell_name",
}

// Weapon Bonus Selection Type
// export enum wsel {
// 	WithRequiredSkill = "weapons_with_required_skill",
// 	WithName = "weapons_with_name",
// 	ThisWeapon = "this_weapon",
// }

// export enum skillsel {
// 	Name = "skills_with_name",
// 	ThisWeapon = "this_weapon",
// 	WeaponsWithName = "weapons_with_name",
// }
