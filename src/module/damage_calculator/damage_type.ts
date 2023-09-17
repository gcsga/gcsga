/**
 * Create the definitions of GURPS damage types.
 */
type DamageType = {
	key: string
	label: string
	theDefault: number
	unliving: number
	homogenous: number
	diffuse: number
	pool?: string
}

const DamageTypes = {
	injury: <DamageType>{
		key: "injury",
		label: "gurps.dmgcalc.type.injury",
		theDefault: 1,
		unliving: 1,
		homogenous: 1,
		diffuse: 1,
	},
	burn: <DamageType>{
		key: "burn",
		label: "gurps.dmgcalc.type.burn",
		theDefault: 1,
		unliving: 1,
		homogenous: 1,
		diffuse: 1,
	},
	cor: <DamageType>{
		key: "cor",
		label: "gurps.dmgcalc.type.cor",
		theDefault: 1,
		unliving: 1,
		homogenous: 1,
		diffuse: 1,
	},
	cr: <DamageType>{
		key: "cr",
		label: "gurps.dmgcalc.type.cr",
		theDefault: 1,
		unliving: 1,
		homogenous: 1,
		diffuse: 1,
	},
	cut: <DamageType>{
		key: "cut",
		label: "gurps.dmgcalc.type.cut",
		theDefault: 1.5,
		unliving: 1,
		homogenous: 1,
		diffuse: 1,
	},
	fat: <DamageType>{
		key: "fat",
		label: "gurps.dmgcalc.type.fat",
		theDefault: 1,
		unliving: 1,
		homogenous: 1,
		diffuse: 1,
		pool: "fp",
	},
	imp: <DamageType>{
		key: "imp",
		label: "gurps.dmgcalc.type.imp",
		theDefault: 2,
		unliving: 1,
		homogenous: 0.5,
		diffuse: 1,
	},
	"pi-": <DamageType>{
		key: "pi-",
		label: "gurps.dmgcalc.type.pi-",
		theDefault: 0.5,
		unliving: 1 / 5,
		homogenous: 1 / 10,
		diffuse: 1,
	},
	pi: <DamageType>{
		key: "pi",
		label: "gurps.dmgcalc.type.pi",
		theDefault: 1,
		unliving: 1 / 3,
		homogenous: 1 / 5,
		diffuse: 1,
	},
	"pi+": <DamageType>{
		key: "pi+",
		label: "gurps.dmgcalc.type.pi+",
		theDefault: 1.5,
		unliving: 0.5,
		homogenous: 1 / 3,
	},
	"pi++": <DamageType>{
		key: "pi++",
		label: "gurps.dmgcalc.type.pi++",
		theDefault: 2,
		unliving: 1,
		homogenous: 0.5,
	},
	tox: <DamageType>{
		key: "tox",
		label: "gurps.dmgcalc.type.tox",
		theDefault: 1,
		unliving: 1,
		homogenous: 1,
	},
	// TODO Should we include "knockback only" as a damage type?
	kb: <DamageType>{
		key: "kb",
		label: "gurps.dmgcalc.type.kb",
		theDefault: 1,
		unliving: 1,
		homogenous: 1,
	},
}

const AnyPiercingType: Array<DamageType> = [DamageTypes.pi, DamageTypes["pi-"], DamageTypes["pi+"], DamageTypes["pi++"]]

export { DamageType, DamageTypes, AnyPiercingType }
