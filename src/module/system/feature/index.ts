import { AttributeBonus } from "./attribute_bonus.ts"
import { ContainedWeightReduction } from "./contained_weight_reduction.ts"
import { CostReduction } from "./cost_reduction.ts"
import {
	AttributeBonusObj,
	ContainedWeightReductionObj,
	CostReductionObj,
	DRBonusObj,
	LeveledAmountObj,
	MoveBonusObj,
	SkillBonusObj,
	SkillPointBonusObj,
	SpellBonusObj,
	SpellPointBonusObj,
	WeaponBonusObj,
} from "./data.ts"
import { DRBonus } from "./dr_bonus.ts"
import { MoveBonus } from "./move_bonus.ts"
import { SkillBonus } from "./skill_bonus.ts"
import { SkillPointBonus } from "./skill_point_bonus.ts"
import { SpellBonus } from "./spell_bonus.ts"
import { SpellPointBonus } from "./spell_point_bonus.ts"
import { WeaponBonus } from "./weapon_bonus.ts"

export { AttributeBonus } from "./attribute_bonus.ts"
export { MoveBonus } from "./move_bonus.ts"
export { ConditionalModifierBonus } from "./conditional_modifier.ts"
export { ContainedWeightReduction } from "./contained_weight_reduction.ts"
export { CostReduction } from "./cost_reduction.ts"
export { DRBonus } from "./dr_bonus.ts"
export { ReactionBonus } from "./reaction_bonus.ts"
export { SkillBonus } from "./skill_bonus.ts"
export { SkillPointBonus } from "./skill_point_bonus.ts"
export { SpellBonus } from "./spell_bonus.ts"
export { SpellPointBonus } from "./spell_point_bonus.ts"
export { WeaponBonus } from "./weapon_bonus.ts"
export * from "./data.ts"

export type Feature =
	| AttributeBonus
	| ContainedWeightReduction
	| CostReduction
	| DRBonus
	| MoveBonus
	| SkillBonus
	| SkillPointBonus
	| SpellBonus
	| SpellPointBonus
	| WeaponBonus

export type FeatureObj =
	| LeveledAmountObj
	| ContainedWeightReductionObj
	| AttributeBonusObj
	| CostReductionObj
	| DRBonusObj
	| MoveBonusObj
	| SkillBonusObj
	| SkillPointBonusObj
	| SpellBonusObj
	| SpellPointBonusObj
	| WeaponBonusObj

export interface FeatureMap {
	attributeBonuses: AttributeBonus[]
	costReductions: CostReduction[]
	drBonuses: DRBonus[]
	skillBonuses: SkillBonus[]
	skillPointBonuses: SkillPointBonus[]
	spellBonuses: SpellBonus[]
	spellPointBonuses: SpellPointBonus[]
	weaponBonuses: WeaponBonus[]
	moveBonuses: MoveBonus[]
}
