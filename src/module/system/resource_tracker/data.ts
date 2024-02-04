import { PoolThresholdDef } from "@sytem/attribute/data.ts"

export interface ResourceTrackerObj {
	// order: number
	tracker_id: string
	damage: number
	calc?: {
		value: number
		current: number
	}
}

export interface ResourceTrackerDefObj {
	id: string
	name: string
	full_name: string
	max: number
	min: number
	isMaxEnforced: boolean
	isMinEnforced: boolean
	thresholds?: PoolThresholdDef[]
	// order: number
}
