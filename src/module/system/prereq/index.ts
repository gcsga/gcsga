import { prereq } from "@util"
import { AttributePrereq } from "./attribute-prereq.ts"
import { ContainedQuantityPrereq } from "./contained-quantity-prereq.ts"
import { ContainedWeightPrereq } from "./contained-weight-prereq.ts"
import { EquippedEquipmentPrereq } from "./equipped-equipment-prereq.ts"
import { PrereqList } from "./prereq-list.ts"
import { SkillPrereq } from "./skill-prereq.ts"
import { SpellPrereq } from "./spell-prereq.ts"
import { TraitPrereq } from "./trait-prereq.ts"

export { AttributePrereq } from "./attribute-prereq.ts"
export { BasePrereq } from "./base.ts"
export { ContainedQuantityPrereq } from "./contained-quantity-prereq.ts"
export { ContainedWeightPrereq } from "./contained-weight-prereq.ts"
export * from "./data.ts"
export { EquippedEquipmentPrereq } from "./equipped-equipment-prereq.ts"
export { PrereqList } from "./prereq-list.ts"
export { SkillPrereq } from "./skill-prereq.ts"
export { SpellPrereq } from "./spell-prereq.ts"
export { TraitPrereq } from "./trait-prereq.ts"

export type Prereq =
	| AttributePrereq
	| ContainedQuantityPrereq
	| ContainedWeightPrereq
	| EquippedEquipmentPrereq
	| PrereqList
	| SkillPrereq
	| SpellPrereq
	| TraitPrereq

export const PrereqClasses: Record<prereq.Type, ConstructorOf> = {
	[prereq.Type.Attribute]: AttributePrereq,
	[prereq.Type.ContainedQuantity]: ContainedQuantityPrereq,
	[prereq.Type.ContainedWeight]: ContainedWeightPrereq,
	[prereq.Type.EquippedEquipment]: EquippedEquipmentPrereq,
	[prereq.Type.List]: PrereqList,
	[prereq.Type.Skill]: SkillPrereq,
	[prereq.Type.Spell]: SpellPrereq,
	[prereq.Type.Trait]: TraitPrereq,
}
