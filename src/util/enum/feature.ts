import { LocalizeGURPS } from "@util/localize.ts"

export namespace feature {
	export enum Type {
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
	}

	export namespace Type {
		export function ensureValid(T: Type): Type {
			if (Types.includes(T)) return T
			return Types[0]
		}

		export function toString(T: Type): string {
			return LocalizeGURPS.translations.gurps.enum.feature[T]
		}
	}

	export const Types: Type[] = [
		Type.AttributeBonus,
		Type.ConditionalModifierBonus,
		Type.DRBonus,
		Type.ReactionBonus,
		Type.SkillBonus,
		Type.SkillPointBonus,
		Type.SpellBonus,
		Type.SpellPointBonus,
		Type.WeaponBonus,
		Type.WeaponAccBonus,
		Type.WeaponScopeAccBonus,
		Type.WeaponDRDivisorBonus,
		Type.WeaponMinSTBonus,
		Type.WeaponMinReachBonus,
		Type.WeaponMaxReachBonus,
		Type.WeaponHalfDamageRangeBonus,
		Type.WeaponMinRangeBonus,
		Type.WeaponMaxRangeBonus,
		Type.WeaponRecoilBonus,
		Type.WeaponBulkBonus,
		Type.WeaponParryBonus,
		Type.WeaponBlockBonus,
		Type.WeaponRofMode1ShotsBonus,
		Type.WeaponRofMode1SecondaryBonus,
		Type.WeaponRofMode2ShotsBonus,
		Type.WeaponRofMode2SecondaryBonus,
		Type.WeaponNonChamberShotsBonus,
		Type.WeaponChamberShotsBonus,
		Type.WeaponShotDurationBonus,
		Type.WeaponReloadTimeBonus,
		Type.WeaponSwitch,
		Type.CostReduction,
		Type.ContainedWeightReduction,
		Type.MoveBonus,
	]

	export const TypesWithoutContainedWeightReduction: Type[] = Types.filter(e => e !== Type.ContainedWeightReduction)

	export const WeaponBonusTypes = [
		Type.WeaponBonus,
		Type.WeaponAccBonus,
		Type.WeaponScopeAccBonus,
		Type.WeaponDRDivisorBonus,
		Type.WeaponMinSTBonus,
		Type.WeaponMinReachBonus,
		Type.WeaponMaxReachBonus,
		Type.WeaponHalfDamageRangeBonus,
		Type.WeaponMinRangeBonus,
		Type.WeaponMaxRangeBonus,
		Type.WeaponRecoilBonus,
		Type.WeaponBulkBonus,
		Type.WeaponParryBonus,
		Type.WeaponBlockBonus,
		Type.WeaponRofMode1ShotsBonus,
		Type.WeaponRofMode1SecondaryBonus,
		Type.WeaponRofMode2ShotsBonus,
		Type.WeaponRofMode2SecondaryBonus,
		Type.WeaponNonChamberShotsBonus,
		Type.WeaponChamberShotsBonus,
		Type.WeaponShotDurationBonus,
		Type.WeaponReloadTimeBonus,
		Type.WeaponSwitch,
	] as const

	export type WeaponBonusType = (typeof WeaponBonusTypes)[number]
}
