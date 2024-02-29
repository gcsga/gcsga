import { AbstractAttributeDefObj, PoolThresholdObj } from "@system"

export interface ResourceTrackerObj {
	id: string
	damage: number
}

export interface ResourceTrackerDefObj extends AbstractAttributeDefObj {
	name: string
	full_name: string
	max: number
	min: number
	isMaxEnforced: boolean
	isMinEnforced: boolean
	thresholds?: PoolThresholdObj[]
	order?: number
}
