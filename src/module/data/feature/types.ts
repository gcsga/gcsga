import { feature } from "@util"
import * as FeatureType from "./index.ts"

export type Feature =
	| FeatureType.AttributeBonus
	| FeatureType.ContainedWeightReduction
	| FeatureType.CostReduction
	| FeatureType.DRBonus
	| FeatureType.MoveBonus
	| FeatureType.SkillBonus
	| FeatureType.SkillPointBonus
	| FeatureType.SpellBonus
	| FeatureType.SpellPointBonus
	| FeatureType.WeaponBonus
	| FeatureType.ReactionBonus
	| FeatureType.ConditionalModifierBonus

export interface FeatureMap {
	attributeBonuses: FeatureType.AttributeBonus[]
	costReductions: FeatureType.CostReduction[]
	drBonuses: FeatureType.DRBonus[]
	skillBonuses: FeatureType.SkillBonus[]
	skillPointBonuses: FeatureType.SkillPointBonus[]
	spellBonuses: FeatureType.SpellBonus[]
	spellPointBonuses: FeatureType.SpellPointBonus[]
	weaponBonuses: FeatureType.WeaponBonus[]
	moveBonuses: FeatureType.MoveBonus[]
}

export const FeatureTypes: Readonly<Record<feature.Type, ConstructorOf<Feature>>> = Object.freeze({
	[feature.Type.AttributeBonus]: FeatureType.AttributeBonus,
	[feature.Type.ConditionalModifierBonus]: FeatureType.ConditionalModifierBonus,
	[feature.Type.DRBonus]: FeatureType.DRBonus,
	[feature.Type.ReactionBonus]: FeatureType.ReactionBonus,
	[feature.Type.SkillBonus]: FeatureType.SkillBonus,
	[feature.Type.SkillPointBonus]: FeatureType.SkillPointBonus,
	[feature.Type.SpellBonus]: FeatureType.SpellBonus,
	[feature.Type.SpellPointBonus]: FeatureType.SpellPointBonus,
	[feature.Type.WeaponBonus]: FeatureType.WeaponBonus,
	[feature.Type.WeaponAccBonus]: FeatureType.WeaponBonus,
	[feature.Type.WeaponScopeAccBonus]: FeatureType.WeaponBonus,
	[feature.Type.WeaponDRDivisorBonus]: FeatureType.WeaponBonus,
	[feature.Type.WeaponEffectiveSTBonus]: FeatureType.WeaponBonus,
	[feature.Type.WeaponMinSTBonus]: FeatureType.WeaponBonus,
	[feature.Type.WeaponMinReachBonus]: FeatureType.WeaponBonus,
	[feature.Type.WeaponMaxReachBonus]: FeatureType.WeaponBonus,
	[feature.Type.WeaponHalfDamageRangeBonus]: FeatureType.WeaponBonus,
	[feature.Type.WeaponMinRangeBonus]: FeatureType.WeaponBonus,
	[feature.Type.WeaponMaxRangeBonus]: FeatureType.WeaponBonus,
	[feature.Type.WeaponRecoilBonus]: FeatureType.WeaponBonus,
	[feature.Type.WeaponBulkBonus]: FeatureType.WeaponBonus,
	[feature.Type.WeaponParryBonus]: FeatureType.WeaponBonus,
	[feature.Type.WeaponBlockBonus]: FeatureType.WeaponBonus,
	[feature.Type.WeaponRofMode1ShotsBonus]: FeatureType.WeaponBonus,
	[feature.Type.WeaponRofMode1SecondaryBonus]: FeatureType.WeaponBonus,
	[feature.Type.WeaponRofMode2ShotsBonus]: FeatureType.WeaponBonus,
	[feature.Type.WeaponRofMode2SecondaryBonus]: FeatureType.WeaponBonus,
	[feature.Type.WeaponNonChamberShotsBonus]: FeatureType.WeaponBonus,
	[feature.Type.WeaponChamberShotsBonus]: FeatureType.WeaponBonus,
	[feature.Type.WeaponShotDurationBonus]: FeatureType.WeaponBonus,
	[feature.Type.WeaponReloadTimeBonus]: FeatureType.WeaponBonus,
	[feature.Type.WeaponSwitch]: FeatureType.WeaponBonus,
	[feature.Type.CostReduction]: FeatureType.CostReduction,
	[feature.Type.ContainedWeightReduction]: FeatureType.ContainedWeightReduction,
	[feature.Type.MoveBonus]: FeatureType.MoveBonus,
})

export interface FeatureInstances {
	[feature.Type.AttributeBonus]: FeatureType.AttributeBonus
	[feature.Type.ConditionalModifierBonus]: FeatureType.ConditionalModifierBonus
	[feature.Type.DRBonus]: FeatureType.DRBonus
	[feature.Type.ReactionBonus]: FeatureType.ReactionBonus
	[feature.Type.SkillBonus]: FeatureType.SkillBonus
	[feature.Type.SkillPointBonus]: FeatureType.SkillPointBonus
	[feature.Type.SpellBonus]: FeatureType.SpellBonus
	[feature.Type.SpellPointBonus]: FeatureType.SpellPointBonus
	[feature.Type.WeaponBonus]: FeatureType.WeaponBonus
	[feature.Type.WeaponAccBonus]: FeatureType.WeaponBonus
	[feature.Type.WeaponScopeAccBonus]: FeatureType.WeaponBonus
	[feature.Type.WeaponDRDivisorBonus]: FeatureType.WeaponBonus
	[feature.Type.WeaponEffectiveSTBonus]: FeatureType.WeaponBonus
	[feature.Type.WeaponMinSTBonus]: FeatureType.WeaponBonus
	[feature.Type.WeaponMinReachBonus]: FeatureType.WeaponBonus
	[feature.Type.WeaponMaxReachBonus]: FeatureType.WeaponBonus
	[feature.Type.WeaponHalfDamageRangeBonus]: FeatureType.WeaponBonus
	[feature.Type.WeaponMinRangeBonus]: FeatureType.WeaponBonus
	[feature.Type.WeaponMaxRangeBonus]: FeatureType.WeaponBonus
	[feature.Type.WeaponRecoilBonus]: FeatureType.WeaponBonus
	[feature.Type.WeaponBulkBonus]: FeatureType.WeaponBonus
	[feature.Type.WeaponParryBonus]: FeatureType.WeaponBonus
	[feature.Type.WeaponBlockBonus]: FeatureType.WeaponBonus
	[feature.Type.WeaponRofMode1ShotsBonus]: FeatureType.WeaponBonus
	[feature.Type.WeaponRofMode1SecondaryBonus]: FeatureType.WeaponBonus
	[feature.Type.WeaponRofMode2ShotsBonus]: FeatureType.WeaponBonus
	[feature.Type.WeaponRofMode2SecondaryBonus]: FeatureType.WeaponBonus
	[feature.Type.WeaponNonChamberShotsBonus]: FeatureType.WeaponBonus
	[feature.Type.WeaponChamberShotsBonus]: FeatureType.WeaponBonus
	[feature.Type.WeaponShotDurationBonus]: FeatureType.WeaponBonus
	[feature.Type.WeaponReloadTimeBonus]: FeatureType.WeaponBonus
	[feature.Type.WeaponSwitch]: FeatureType.WeaponBonus
	[feature.Type.CostReduction]: FeatureType.CostReduction
	[feature.Type.ContainedWeightReduction]: FeatureType.ContainedWeightReduction
	[feature.Type.MoveBonus]: FeatureType.MoveBonus
}
