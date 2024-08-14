import { AttributeBonus } from "./attribute-bonus.ts"
import { ConditionalModifierBonus } from "./conditional-modifier-bonus.ts"
import { ContainedWeightReduction } from "./contained-weight-reduction.ts"
import { CostReduction } from "./cost-reduction.ts"
import { DRBonus } from "./dr-bonus.ts"
import { MoveBonus } from "./move-bonus.ts"
import { ReactionBonus } from "./reaction-bonus.ts"
import { SkillBonus } from "./skill-bonus.ts"
import { SkillPointBonus } from "./skill-point-bonus.ts"
import { SpellBonus } from "./spell-bonus.ts"
import { SpellPointBonus } from "./spell-point-bonus.ts"
import { WeaponBonus } from "./weapon-bonus.ts"

export { AttributeBonus } from "./attribute-bonus.ts"
export { MoveBonus } from "./move-bonus.ts"
export { ConditionalModifierBonus } from "./conditional-modifier-bonus.ts"
export { ContainedWeightReduction } from "./contained-weight-reduction.ts"
export { CostReduction } from "./cost-reduction.ts"
export { DRBonus } from "./dr-bonus.ts"
export { ReactionBonus } from "./reaction-bonus.ts"
export { SkillBonus } from "./skill-bonus.ts"
export { SkillPointBonus } from "./skill-point-bonus.ts"
export { SpellBonus } from "./spell-bonus.ts"
export { SpellPointBonus } from "./spell-point-bonus.ts"
export { WeaponBonus } from "./weapon-bonus.ts"
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
	| ReactionBonus
	| ConditionalModifierBonus

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
