export interface MoveTypeObj {
	move_type_id: string
	adj: number
	move_type_def: MoveTypeDefObj
	calc?: {
		value: number
		points: number
	}
}

export interface MoveTypeDefObj {
	id: string
	name: string
	move_type_base: string
	cost_per_point?: number
}
