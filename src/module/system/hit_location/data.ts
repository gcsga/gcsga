interface BodyObj {
	name?: string
	roll: string
	locations?: HitLocationObj[]
}

interface HitLocationObj {
	id: string
	choice_name: string
	table_name: string
	slots?: number
	hit_penalty?: number
	dr_bonus?: number
	description?: string
	sub_table?: BodyObj
}

export type { BodyObj, HitLocationObj }
