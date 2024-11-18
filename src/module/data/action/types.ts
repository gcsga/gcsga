import { ActionType } from "../constants.ts"
import * as ActionInstance from "./index.ts"

export type Action =
	| ActionInstance.AttackMelee
	| ActionInstance.AttackRanged
	| ActionInstance.ActionHeal
	| ActionInstance.ActionUtility

export type ActionClass =
	| typeof ActionInstance.AttackMelee
	| typeof ActionInstance.AttackRanged
	| typeof ActionInstance.ActionHeal
	| typeof ActionInstance.ActionUtility

export type ActionSchema =
	| ActionInstance.AttackMeleeSchema
	| ActionInstance.AttackRangedSchema
	| ActionInstance.ActionHealSchema
	| ActionInstance.ActionUtilitySchema

export const ActionInstances: Readonly<Record<ActionType, ConstructorOf<Action>>> = Object.freeze({
	[ActionType.AttackMelee]: ActionInstance.AttackMelee,
	[ActionType.AttackRanged]: ActionInstance.AttackRanged,
	[ActionType.Heal]: ActionInstance.ActionHeal,
	[ActionType.Utility]: ActionInstance.ActionUtility,
})

export interface ActionInstances {
	[ActionType.AttackMelee]: ActionInstance.AttackMelee
	[ActionType.AttackRanged]: ActionInstance.AttackRanged
	[ActionType.Heal]: ActionInstance.ActionHeal
	[ActionType.Utility]: ActionInstance.ActionUtility
}
