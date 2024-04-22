import { AbstractAttributeDefObj, AbstractAttributeObj } from "@system"

export interface MoveTypeObj extends AbstractAttributeObj {
	adj: number
}

export interface MoveTypeDefObj extends AbstractAttributeDefObj {
	name: string
	cost_per_point?: number
	overrides: MoveTypeOverrideObj[]
	order?: number
}

export interface MoveTypeOverrideObj {
	condition: {
		type: MoveTypeOverrideConditionType
		qualifier: string
	}
	base: string
}

export enum MoveTypeOverrideConditionType {
	Trait = "trait",
	Skill = "skill",
	Condition = "condition",
}

export const allMoveTypeOverrideConditions: MoveTypeOverrideConditionType[] = [
	MoveTypeOverrideConditionType.Trait,
	MoveTypeOverrideConditionType.Skill,
	MoveTypeOverrideConditionType.Condition,
]
