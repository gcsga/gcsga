/**
 * Create the definitions of GURPS damage types.
 */
type DamageType = {
	id: string
	full_name: string
	pool_id: string // default to 'hp'
	bluntTraumaDivisor: number // default to 1
	woundingModifier: number
	unliving: number
	homogenous: number
	diffuse: number
}

enum DAMAGE_TYPE {
	Injury = "injury",
	Burning = "burn",
	Corrosion = "cor",
	Crushing = "cr",
	Cutting = "cut",
	Fatigue = "fat",
	Impaling = "imp",
	SmallPiercing = "pi-",
	Piercing = "pi",
	LargePiercing = "pi+",
	HugePiercing = "pi++",
	Toxic = "tox",
	Knobckback = "kb",
}

const DamageTypes: Record<DAMAGE_TYPE, DamageType> = {
	[DAMAGE_TYPE.Injury]: <DamageType>{
		id: "injury",
		full_name: "gurps.dmgcalc.type.injury",
		pool_id: "hp",
		bluntTraumaDivisor: 1,
		woundingModifier: 1,
		unliving: 1,
		homogenous: 1,
		diffuse: 1,
	},
	[DAMAGE_TYPE.Burning]: <DamageType>{
		id: "burn",
		full_name: "gurps.dmgcalc.type.burn",
		pool_id: "hp",
		bluntTraumaDivisor: 1,
		woundingModifier: 1,
		unliving: 1,
		homogenous: 1,
		diffuse: 1,
	},
	[DAMAGE_TYPE.Corrosion]: <DamageType>{
		id: "cor",
		full_name: "gurps.dmgcalc.type.cor",
		pool_id: "hp",
		bluntTraumaDivisor: 1,
		woundingModifier: 1,
		unliving: 1,
		homogenous: 1,
		diffuse: 1,
	},
	[DAMAGE_TYPE.Crushing]: <DamageType>{
		id: "cr",
		full_name: "gurps.dmgcalc.type.cr",
		pool_id: "hp",
		bluntTraumaDivisor: 5,
		woundingModifier: 1,
		unliving: 1,
		homogenous: 1,
		diffuse: 1,
	},
	[DAMAGE_TYPE.Cutting]: <DamageType>{
		id: "cut",
		full_name: "gurps.dmgcalc.type.cut",
		pool_id: "hp",
		bluntTraumaDivisor: 10,
		woundingModifier: 1.5,
		unliving: 1,
		homogenous: 1,
		diffuse: 1,
	},
	[DAMAGE_TYPE.Fatigue]: <DamageType>{
		id: "fat",
		full_name: "gurps.dmgcalc.type.fat",
		pool_id: "fp",
		bluntTraumaDivisor: 1,
		woundingModifier: 1,
		unliving: 1,
		homogenous: 1,
		diffuse: 1,
	},
	[DAMAGE_TYPE.Impaling]: <DamageType>{
		id: "imp",
		full_name: "gurps.dmgcalc.type.imp",
		pool_id: "hp",
		bluntTraumaDivisor: 10,
		woundingModifier: 2,
		unliving: 1,
		homogenous: 0.5,
		diffuse: 1,
	},
	[DAMAGE_TYPE.SmallPiercing]: <DamageType>{
		id: "pi-",
		full_name: "gurps.dmgcalc.type.pi-",
		pool_id: "hp",
		bluntTraumaDivisor: 10,
		woundingModifier: 0.5,
		unliving: 1 / 5,
		homogenous: 1 / 10,
		diffuse: 1,
	},
	[DAMAGE_TYPE.Piercing]: <DamageType>{
		id: "pi",
		full_name: "gurps.dmgcalc.type.pi",
		pool_id: "hp",
		bluntTraumaDivisor: 10,
		woundingModifier: 1,
		unliving: 1 / 3,
		homogenous: 1 / 5,
		diffuse: 1,
	},
	[DAMAGE_TYPE.LargePiercing]: <DamageType>{
		id: "pi+",
		full_name: "gurps.dmgcalc.type.pi+",
		pool_id: "hp",
		bluntTraumaDivisor: 10,
		woundingModifier: 1.5,
		unliving: 0.5,
		homogenous: 1 / 3,
	},
	[DAMAGE_TYPE.HugePiercing]: <DamageType>{
		id: "pi++",
		full_name: "gurps.dmgcalc.type.pi++",
		pool_id: "hp",
		bluntTraumaDivisor: 10,
		woundingModifier: 2,
		unliving: 1,
		homogenous: 0.5,
	},
	[DAMAGE_TYPE.Toxic]: <DamageType>{
		id: "tox",
		full_name: "gurps.dmgcalc.type.tox",
		pool_id: "hp",
		bluntTraumaDivisor: 1,
		woundingModifier: 1,
		unliving: 1,
		homogenous: 1,
	},
	// TODO Should we include "knockback only" as a damage type?
	[DAMAGE_TYPE.Knobckback]: <DamageType>{
		id: "kb",
		full_name: "gurps.dmgcalc.type.kb",
		pool_id: "hp",
		bluntTraumaDivisor: 1,
		woundingModifier: 1,
		unliving: 1,
		homogenous: 1,
	},
} as const

const AnyPiercingType: DamageType[] = [
	DamageTypes[DAMAGE_TYPE.Piercing],
	DamageTypes[DAMAGE_TYPE.SmallPiercing],
	DamageTypes[DAMAGE_TYPE.LargePiercing],
	DamageTypes[DAMAGE_TYPE.HugePiercing],
]

export { DamageTypes, AnyPiercingType, DAMAGE_TYPE }
export type { DamageType }
