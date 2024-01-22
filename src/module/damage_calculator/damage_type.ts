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

const DamageTypes = {
	injury: <DamageType>{
		id: "injury",
		full_name: "gurps.dmgcalc.type.injury",
		pool_id: "hp",
		bluntTraumaDivisor: 1,
		woundingModifier: 1,
		unliving: 1,
		homogenous: 1,
		diffuse: 1,
	},
	burn: <DamageType>{
		id: "burn",
		full_name: "gurps.dmgcalc.type.burn",
		pool_id: "hp",
		bluntTraumaDivisor: 1,
		woundingModifier: 1,
		unliving: 1,
		homogenous: 1,
		diffuse: 1,
	},
	cor: <DamageType>{
		id: "cor",
		full_name: "gurps.dmgcalc.type.cor",
		pool_id: "hp",
		bluntTraumaDivisor: 1,
		woundingModifier: 1,
		unliving: 1,
		homogenous: 1,
		diffuse: 1,
	},
	cr: <DamageType>{
		id: "cr",
		full_name: "gurps.dmgcalc.type.cr",
		pool_id: "hp",
		bluntTraumaDivisor: 5,
		woundingModifier: 1,
		unliving: 1,
		homogenous: 1,
		diffuse: 1,
	},
	cut: <DamageType>{
		id: "cut",
		full_name: "gurps.dmgcalc.type.cut",
		pool_id: "hp",
		bluntTraumaDivisor: 10,
		woundingModifier: 1.5,
		unliving: 1,
		homogenous: 1,
		diffuse: 1,
	},
	fat: <DamageType>{
		id: "fat",
		full_name: "gurps.dmgcalc.type.fat",
		pool_id: "fp",
		bluntTraumaDivisor: 1,
		woundingModifier: 1,
		unliving: 1,
		homogenous: 1,
		diffuse: 1,
	},
	imp: <DamageType>{
		id: "imp",
		full_name: "gurps.dmgcalc.type.imp",
		pool_id: "hp",
		bluntTraumaDivisor: 10,
		woundingModifier: 2,
		unliving: 1,
		homogenous: 0.5,
		diffuse: 1,
	},
	"pi-": <DamageType>{
		id: "pi-",
		full_name: "gurps.dmgcalc.type.pi-",
		pool_id: "hp",
		bluntTraumaDivisor: 10,
		woundingModifier: 0.5,
		unliving: 1 / 5,
		homogenous: 1 / 10,
		diffuse: 1,
	},
	pi: <DamageType>{
		id: "pi",
		full_name: "gurps.dmgcalc.type.pi",
		pool_id: "hp",
		bluntTraumaDivisor: 10,
		woundingModifier: 1,
		unliving: 1 / 3,
		homogenous: 1 / 5,
		diffuse: 1,
	},
	"pi+": <DamageType>{
		id: "pi+",
		full_name: "gurps.dmgcalc.type.pi+",
		pool_id: "hp",
		bluntTraumaDivisor: 10,
		woundingModifier: 1.5,
		unliving: 0.5,
		homogenous: 1 / 3,
	},
	"pi++": <DamageType>{
		id: "pi++",
		full_name: "gurps.dmgcalc.type.pi++",
		pool_id: "hp",
		bluntTraumaDivisor: 10,
		woundingModifier: 2,
		unliving: 1,
		homogenous: 0.5,
	},
	tox: <DamageType>{
		id: "tox",
		full_name: "gurps.dmgcalc.type.tox",
		pool_id: "hp",
		bluntTraumaDivisor: 1,
		woundingModifier: 1,
		unliving: 1,
		homogenous: 1,
	},
	// TODO Should we include "knockback only" as a damage type?
	kb: <DamageType>{
		id: "kb",
		full_name: "gurps.dmgcalc.type.kb",
		pool_id: "hp",
		bluntTraumaDivisor: 1,
		woundingModifier: 1,
		unliving: 1,
		homogenous: 1,
	},
}

const AnyPiercingType: Array<DamageType> = [DamageTypes.pi, DamageTypes["pi-"], DamageTypes["pi+"], DamageTypes["pi++"]]

export { DamageType, DamageTypes, AnyPiercingType }
