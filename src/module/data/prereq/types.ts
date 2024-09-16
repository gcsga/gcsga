import { prereq } from "@util"
import * as PrereqType from "./index.ts"

export type Prereq =
	| PrereqType.AttributePrereq
	| PrereqType.ContainedQuantityPrereq
	| PrereqType.ContainedWeightPrereq
	| PrereqType.EquippedEquipmentPrereq
	| PrereqType.SkillPrereq
	| PrereqType.SpellPrereq
	| PrereqType.TraitPrereq
	| PrereqType.PrereqList

export const PrereqTypes: Readonly<Record<prereq.Type, ConstructorOf<Prereq>>> = Object.freeze({
	[prereq.Type.List]: PrereqType.PrereqList,
	[prereq.Type.Trait]: PrereqType.TraitPrereq,
	[prereq.Type.Attribute]: PrereqType.AttributePrereq,
	[prereq.Type.ContainedQuantity]: PrereqType.ContainedQuantityPrereq,
	[prereq.Type.ContainedWeight]: PrereqType.ContainedWeightPrereq,
	[prereq.Type.EquippedEquipment]: PrereqType.EquippedEquipmentPrereq,
	[prereq.Type.Skill]: PrereqType.SkillPrereq,
	[prereq.Type.Spell]: PrereqType.SpellPrereq,
})

export interface PrereqInstances {
	[prereq.Type.List]: PrereqType.PrereqList
	[prereq.Type.Trait]: PrereqType.TraitPrereq
	[prereq.Type.Attribute]: PrereqType.AttributePrereq
	[prereq.Type.ContainedQuantity]: PrereqType.ContainedQuantityPrereq
	[prereq.Type.ContainedWeight]: PrereqType.ContainedWeightPrereq
	[prereq.Type.EquippedEquipment]: PrereqType.EquippedEquipmentPrereq
	[prereq.Type.Skill]: PrereqType.SkillPrereq
	[prereq.Type.Spell]: PrereqType.SpellPrereq
}
