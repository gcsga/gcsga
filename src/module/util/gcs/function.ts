import { ErrorGURPS, Int, encumbrance, trimS } from "@util"
import { equalFold } from "../string-criteria.ts"
import { Evaluator, Operand, resolverIsCharacter } from "./eval.ts"
import { ItemType } from "@module/data/constants.ts"
import { DiceGURPS } from "@system"

export function evalFunctions(): Map<string, Function> {
	const m = new Map()
	m.set("abs", evalAbsolute)
	m.set("cbrt", evalCubeRoot)
	m.set("ceil", evalCeiling)
	m.set("exp", evalBaseEExpontential)
	m.set("exp2", evalBase2Expontential)
	m.set("floor", evalFloor)
	m.set("if", evalIf)
	m.set("log", evalNaturalLog)
	m.set("log1p", evalNaturalLogSum)
	m.set("log10", evalDecimalLog)
	m.set("max", evalMaximum)
	m.set("min", evalMinimum)
	m.set("round", evalRound)
	m.set("sqrt", evalSquareRoot)
	m.set("add_dice", evalAddDice)
	m.set("advantage_level", evalTraitLevel)
	m.set("dice", evalDice)
	m.set("dice_count", evalDiceCount)
	m.set("dice_modifier", evalDiceModifier)
	m.set("dice_multiplier", evalDiceMultiplier)
	m.set("dice_sides", evalDiceSides)
	m.set("enc", evalEncumbrance)
	m.set("has_trait", evalHasTrait)
	m.set("random_height", evalRandomHeight)
	m.set("random_weight", evalRandomWeight)
	m.set("roll", evalRoll)
	m.set("signed", evalSigned)
	m.set("skill_level", evalSkillLevel)
	m.set("ssrt", evalSSRT)
	m.set("ssrt_to_yards", evalSSRTYards)
	m.set("subtract_dice", evalSubtractDice)
	m.set("trait_level", evalTraitLevel)
	m.set("weapon_damage", evalWeaponDamage)
	return m
}

function evalAbsolute(e: Evaluator, args: string): Operand {
	const value = evalToFixed(e, args)
	if (value === null) return null
	return Math.abs(value)
}

function evalBase2Expontential(e: Evaluator, args: string): Operand {
	const value = evalToFixed(e, args)
	if (value === null) return null
	return Int.from(2 ** value)
}

function evalBaseEExpontential(e: Evaluator, args: string): Operand {
	const value = evalToFixed(e, args)
	if (value === null) return null
	return Int.from(Math.exp(value))
}

function evalCeiling(e: Evaluator, args: string): Operand {
	const value = evalToFixed(e, args)
	if (value === null) return null
	return Math.ceil(value)
}

function evalCubeRoot(e: Evaluator, args: string): Operand {
	const value = evalToFixed(e, args)
	if (value === null) return null
	return Int.from(Math.cbrt(value))
}

function evalDecimalLog(e: Evaluator, args: string): Operand {
	const value = evalToFixed(e, args)
	if (value === null) return null
	return Int.from(Math.log10(value))
}

function evalFloor(e: Evaluator, args: string): Operand {
	const value = evalToFixed(e, args)
	if (value === null) return null
	return Math.floor(value)
}

function evalIf(e: Evaluator, args: string): Operand {
	let arg = ""
	;[arg, args] = nextArg(args)
	const evaluated = e.evaluateNew(arg)
	if (evaluated === null) return null

	let value = fixedFrom(evaluated)
	if (value === null) {
		if (typeof evaluated === "string") {
			if (evaluated !== "" && !equalFold(evaluated, "false")) {
				value = value + 1
			}
		} else {
			console.error("if expression is invalid.")
			return null
		}
	}
	if (value === 0) {
		;[, args] = nextArg(args)
	}
	;[arg] = nextArg(args)
	return e.evaluateNew(arg)
}

function evalMaximum(e: Evaluator, args: string): Operand {
	let maximum = Number.MIN_SAFE_INTEGER
	while (args !== "") {
		let arg = ""
		;[arg, args] = nextArg(args)
		const value = evalToFixed(e, arg)
		if (value === null) {
			return null
		}
		maximum = Math.max(maximum, value)
	}
	return maximum
}

function evalMinimum(e: Evaluator, args: string): Operand {
	let maximum = Number.MAX_SAFE_INTEGER
	while (args !== "") {
		let arg = ""
		;[arg, args] = nextArg(args)
		const value = evalToFixed(e, arg)
		if (value === null) {
			return null
		}
		maximum = Math.min(maximum, value)
	}
	return maximum
}

function evalNaturalLog(e: Evaluator, args: string): Operand {
	const value = evalToFixed(e, args)
	if (value === null) return null
	return Int.from(Math.log(value))
}

function evalNaturalLogSum(e: Evaluator, args: string): Operand {
	let value = evalToFixed(e, args)
	if (value === null) return null
	return Int.from(Math.log1p(value))
}

function evalRound(e: Evaluator, args: string): Operand {
	let value = evalToFixed(e, args)
	if (value === null) return null
	return Math.round(value)
}

function evalSquareRoot(e: Evaluator, args: string): Operand {
	let value = evalToFixed(e, args)
	if (value === null) return null
	return Int.from(Math.sqrt(value))
}

function evalToFixed(e: Evaluator, arg: string): number {
	const evaluated = e.evaluateNew(arg)
	if (evaluated === null) {
		return 0
	}
	return fixedFrom(evaluated)
}

function evalToBool(e: Evaluator, args: string): boolean {
	let evaluated: Operand
	try {
		evaluated = e.evaluateNew(args)
	} catch (err) {
		throw err
		// console.log(err)
		// return false
	}
	switch (typeof evaluated) {
		case "boolean":
			return evaluated
		case "number":
			return evaluated !== 0
		case "string": {
			evaluated = evaluated.toLowerCase()
			return evaluated == "1" || evaluated === "true" || evaluated === "yes" || evaluated === "on"
		}
		default:
			return false
	}
}

function evalToNumber(e: Evaluator, args: string): number {
	let evaluated: Operand
	try {
		evaluated = e.evaluateNew(args)
	} catch (err) {
		throw err
		// console.error(err)
		// return 0
	}
	return fixedFrom(evaluated)
}

function evalToString(e: Evaluator, args: string): string {
	let v: Operand
	try {
		v = e.evaluateNew(args)
	} catch (err) {
		throw err
	}
	return `${v}`
}

function evalEncumbrance(e: Evaluator, args: string): number {
	let [arg, remaining] = nextArg(args)
	let forSkills: boolean
	try {
		forSkills = evalToBool(e, arg)
	} catch (err) {
		throw err
	}
	let returnFactor = false
	;[arg] = nextArg(remaining)
	arg = arg.trim()
	if (arg !== "") {
		try {
			returnFactor = evalToBool(e, remaining)
		} catch (err) {
			throw err
		}
	}
	const actor = e.resolver
	if (!resolverIsCharacter(actor)) {
		return 0
	}
	const level = encumbrance.Levels.indexOf(actor.encumbranceLevel(forSkills))
	if (returnFactor) {
		return 1 - Int.from((level * 2) / 10)
	}
	return level
}

function evalSkillLevel(e: Evaluator, args: string): number {
	const actor = e.resolver
	if (!resolverIsCharacter(actor)) {
		return 0
	}
	let [name, remaining] = nextArg(args)
	try {
		name = evalToString(e, name)
	} catch (err) {
		console.error(err)
		0
	}

	let specialization: string
	;[specialization, remaining] = nextArg(remaining)
	specialization = specialization.trim()
	if (specialization !== "") {
		try {
			specialization = evalToString(e, specialization)
		} catch (err) {
			console.error(err)
			0
		}
	}

	let relative: boolean
	let [arg] = nextArg(remaining)
	arg = arg.trim()
	if (arg !== "") {
		try {
			relative = evalToBool(e, arg)
		} catch (err) {
			console.error(err)
			0
		}
	}

	if (actor.isSkillLevelResolutionExcluded(name, specialization)) {
		return 0
	}

	actor.registerSkillLevelResolutionExclusion(name, specialization)
	try {
		let level = 0
		actor.parent.itemCollections.skills.forEach(skill => {
			if (skill.isOfType(ItemType.SkillContainer)) return
			if (
				equalFold(skill.system.nameWithReplacements, name) &&
				equalFold(skill.system.specializationWithReplacements, specialization)
			) {
				skill.system.updateLevel()
				if (relative) level = skill.system.level.relativeLevel
				else level = skill.system.level.level
			}
		})
		return level
	} finally {
		actor.unregisterSkillLevelResolutionExclusion(name, specialization)
	}
}

function evalHasTrait(e: Evaluator, args: string): boolean {
	const actor = e.resolver
	if (!resolverIsCharacter(actor)) {
		return false
	}
	args = trimS(args, `"`)
	for (const trait of actor.parent.itemCollections.traits) {
		if (equalFold(trait.system.nameWithReplacements, args)) {
			return true
		}
	}
	return false
}

function evalTraitLevel(e: Evaluator, args: string): number {
	const actor = e.resolver
	if (!resolverIsCharacter(actor)) {
		return -1
	}
	args = trimS(args, `"`)
	let levels = -1
	for (const trait of actor.parent.itemCollections.traits) {
		if (trait.isOfType(ItemType.TraitContainer)) continue
		if (equalFold(trait.system.nameWithReplacements, args)) {
			if (trait.system.isLeveled) {
				if (levels === -1) levels = trait.system.levels
				else levels += trait.system.levels
			}
		}
	}
	return levels
}

function evalWeaponDamage(e: Evaluator, args: string): string {
	const actor = e.resolver
	if (!resolverIsCharacter(actor)) {
		return ""
	}
	let arg: string
	;[arg, args] = nextArg(args)
	let name: string
	try {
		name = evalToString(e, trimS(arg, `"`))
	} catch (err) {
		throw err
	}
	;[arg] = nextArg(args)
	let usage: string
	try {
		usage = evalToString(e, trimS(arg, `"`))
	} catch (err) {
		throw err
	}
	for (const w of actor.parent.itemCollections.meleeWeapons) {
		if (equalFold(w.system.processedName, name) && equalFold(w.system.usageWithReplacements, usage))
			return w.system.damage.resolvedDamage(null)
	}
	for (const w of actor.parent.itemCollections.rangedWeapons) {
		if (equalFold(w.system.processedName, name) && equalFold(w.system.usageWithReplacements, usage))
			return w.system.damage.resolvedDamage(null)
	}
	return ""
}

function evalDice(e: Evaluator, args: string): string {
	const argList: number[] = []
	while (args !== "") {
		let arg: string
		;[arg, args] = nextArg(args)
		let n: number
		try {
			n = evalToNumber(e, arg)
		} catch (err) {
			throw err
		}
		argList.push(n)
	}
	let d: DiceGURPS
	switch (argList.length) {
		case 1:
			d = new DiceGURPS({ count: 1, sides: argList[0], multiplier: 1 })
			break
		case 2:
			d = new DiceGURPS({ count: argList[0], sides: argList[1], multiplier: 1 })
			break
		case 3:
			d = new DiceGURPS({ count: argList[0], sides: argList[1], modifier: argList[2], multiplier: 1 })
			break
		case 4:
			d = new DiceGURPS({ count: argList[0], sides: argList[1], modifier: argList[2], multiplier: argList[3] })
			break
		default:
			throw ErrorGURPS("invalid dice specification")
	}
	return d.toString(true)
}

function evalAddDice(e: Evaluator, args: string): string {
	let first: string
	;[first, args] = nextArg(args)
	if (first.indexOf("(") !== -1) {
		try {
			first = evalToString(e, first)
		} catch (err) {
			throw err
		}
	}

	let second: string
	;[second, args] = nextArg(args)
	if (second.indexOf("(") !== -1) {
		try {
			second = evalToString(e, second)
		} catch (err) {
			throw err
		}
	}

	const d1 = DiceGURPS.fromString(first)
	const d2 = DiceGURPS.fromString(second)
	if (d1.sides !== d2.sides) {
		throw ErrorGURPS("dice sides must match")
	}
	if (d1.multiplier > 0) {
		d1.count *= d1.multiplier
		d1.modifier *= d1.multiplier
		d1.multiplier = 1
	}

	if (d2.multiplier > 0) {
		d2.count *= d2.multiplier
		d2.modifier *= d2.multiplier
		d2.multiplier = 1
	}

	d1.count += d2.count
	d1.modifier += d2.modifier
	return d1.toString(true)
}

function evalSubtractDice(e: Evaluator, args: string): string {
	let first: string
	;[first, args] = nextArg(args)
	if (first.indexOf("(") !== -1) {
		try {
			first = evalToString(e, first)
		} catch (err) {
			throw err
		}
	}

	let second: string
	;[second, args] = nextArg(args)
	if (second.indexOf("(") !== -1) {
		try {
			second = evalToString(e, second)
		} catch (err) {
			throw err
		}
	}

	const d1 = DiceGURPS.fromString(first)
	const d2 = DiceGURPS.fromString(second)
	if (d1.sides !== d2.sides) {
		throw ErrorGURPS("dice sides must match")
	}
	if (d1.multiplier > 0) {
		d1.count *= d1.multiplier
		d1.modifier *= d1.multiplier
		d1.multiplier = 1
	}

	if (d2.multiplier > 0) {
		d2.count *= d2.multiplier
		d2.modifier *= d2.multiplier
		d2.multiplier = 1
	}

	d1.count -= d2.count
	d1.count = Math.max(d1.count, 0)
	d1.modifier -= d2.modifier
	return d1.toString(true)
}

function evalDiceCount(e: Evaluator, args: string): number {
	let d: DiceGURPS
	try {
		d = convertToDice(e, args)
	} catch (err) {
		throw err
	}
	return d.count
}

function evalDiceSides(e: Evaluator, args: string): number {
	let d: DiceGURPS
	try {
		d = convertToDice(e, args)
	} catch (err) {
		throw err
	}
	return d.sides
}

function evalDiceModifier(e: Evaluator, args: string): number {
	let d: DiceGURPS
	try {
		d = convertToDice(e, args)
	} catch (err) {
		throw err
	}
	return d.modifier
}

function evalDiceMultiplier(e: Evaluator, args: string): number {
	let d: DiceGURPS
	try {
		d = convertToDice(e, args)
	} catch (err) {
		throw err
	}
	return d.multiplier
}

function evalRoll(e: Evaluator, args: string): number {
	let d: DiceGURPS
	try {
		d = convertToDice(e, args)
	} catch (err) {
		throw err
	}
	return Int.from(d.roll(false))
}

function convertToDice(e: Evaluator, args: string): DiceGURPS {
	if (args.indexOf("(") !== 1) {
		try {
			args = evalToString(e, args)
		} catch (err) {
			throw err
		}
	}
	return DiceGURPS.fromString(args)
}

function evalSigned(e: Evaluator, args: string): string {
	let n: number
	try {
		n = evalToNumber(e, args)
	} catch (err) {
		throw err
	}
	return n.signedString()
}

function evalSSRT(e: Evaluator, args: string): number {
	// Takes 3 args: length (number), units (string), flag (bool) indicating for size (true) or speed/range (false)
	let arg: string
	;[arg, args] = nextArg(args)
	let n: string
	try {
		n = evalToString(e, args)
	} catch (err) {
		throw err
	}

	;[arg, args] = nextArg(args)
	let units: string
	try {
		units = evalToString(e, args)
	} catch (err) {
		throw err
	}

	;[arg, args] = nextArg(args)
	let wantSize: boolean
	try {
		wantSize = evalToBool(e, args)
	} catch (err) {
		throw err
	}

	let result = yardsToValue(length, wantSize)
	if (!wantSize) result = -result
	return Int.from(result)
}

function evalSSRTYards(e: Evaluator, args: string): number {
	let v: number
	try {
		v = evalToNumber(e, args)
	} catch (err) {
		throw err
	}
	return valueToYards(v)
}

function yardsToValue(length: number, allowNegative: boolean): number {
	const inches = Int.from(length)
	let yards = Int.from(inches / 36)
	if (allowNegative) {
		switch (true) {
			case inches <= 1 / 5:
				return -15
			case inches <= 1 / 3:
				return -14
			case inches <= 1 / 2:
				return -13
			case inches <= 2 / 3:
				return -12
			case inches <= 1:
				return -11
			case inches <= 1.5:
				return -10
			case inches <= 2:
				return -9
			case inches <= 3:
				return -8
			case inches <= 5:
				return -7
			case inches <= 8:
				return -6
		}
		const feet = Int.from(inches / 12)
		switch (true) {
			case feet <= 1:
				return -5
			case feet <= 1.5:
				return -4
			case feet <= 2:
				return -3
			case yards <= 1:
				return -2
			case yards <= 1.5:
				return -1
		}
	}
	if (yards <= 2) return 0
	let amt = 0
	while (yards > 10) {
		yards = Int.from(yards / 10)
		amt += 6
	}
	switch (true) {
		case yards > 7:
			return amt + 4
		case yards > 5:
			return amt + 3
		case yards > 3:
			return amt + 2
		case yards > 2:
			return amt + 1
		case yards > 1.5:
			return amt
		default:
			return amt - 1
	}
}

function valueToYards(value: number): number {
	if (value < -15) value = -15
	switch (value) {
		case -15:
			return Int.from(1 / 5 / 36)
		case -14:
			return Int.from(1 / 3 / 36)
		case -13:
			return Int.from(1 / 2 / 36)
		case -12:
			return Int.from(2 / 3 / 36)
		case -11:
			return Int.from(1 / 36)
		case -10:
			return Int.from(1.5 / 36)
		case -9:
			return Int.from(2 / 36)
		case -8:
			return Int.from(3 / 36)
		case -7:
			return Int.from(5 / 36)
		case -6:
			return Int.from(8 / 36)
		case -5:
			return Int.from(1 / 3)
		case -4:
			return Int.from(2 / 3)
		case -3:
			return 1 / 2
		case -2:
			return 1
		case -1:
			return 1.5
		case 0:
			return 2
		case 1:
			return 3
		case 2:
			return 5
		case 3:
			return 7
	}
	value -= 4
	let multiplier = 1
	for (let i = 0; i < value / 6; i++) {
		multiplier *= 10
	}
	let v = 0
	switch (value % 6) {
		case 0:
			v = 10
			break
		case 1:
			v = 15
			break
		case 2:
			v = 20
			break
		case 3:
			v = 30
			break
		case 4:
			v = 50
			break
		case 5:
			v = 70
	}
	return Int.from(v * multiplier)
}

function evalRandomHeight(e: Evaluator, args: string): number {
	const actor = e.resolver
	if (!resolverIsCharacter(actor)) {
		return -1
	}
	let stDecimal: number
	try {
		stDecimal = evalToNumber(e, args)
	} catch (err) {
		throw err
	}
	const st = Int.from(stDecimal)
	const r = (n: number) => Math.random() * n
	return Int.from(68 + (st - 10) * 2 + (r(6) + 1) - (r(6) + 1))
}

function evalRandomWeight(e: Evaluator, args: string): number {
	const actor = e.resolver
	if (!resolverIsCharacter(actor)) {
		return -1
	}
	let arg: string
	;[arg, args] = nextArg(args)
	let stDecimal: number
	try {
		stDecimal = evalToNumber(e, args)
	} catch (err) {
		throw err
	}
	const st = Int.from(stDecimal)
	let adj = 0
	if (args !== "") {
		let adjDecimal: number
		try {
			adjDecimal = evalToNumber(e, args)
		} catch (err) {
			throw err
		}
		adj = Int.from(adjDecimal)
	}
	adj += 3 // average
	let skinny = false
	let overweight = false
	let fat = false
	let veryFat = false
	for (const trait of actor.parent.itemCollections.traits) {
		switch (trait.system.nameWithReplacements.toLowerCase()) {
			case "skinny":
				skinny = true
				break
			case "overweight":
				overweight = true
				break
			case "fat":
				fat = true
				break
			case "very fat":
				veryFat = true
		}
	}
	switch (true) {
		case skinny:
			adj -= 1
			break
		case veryFat:
			adj += 3
			break
		case fat:
			adj += 2
			break
		case overweight:
			adj += 1
	}
	const r = (n: number) => Math.random() * n
	const mid = 145 + (st - 10) * 15
	const deviation = mid / 5 + 2
	return Int.from(((mid + r(deviation) - r(deviation)) * adj) / 3)
}

function fixedFrom(arg: Operand): number {
	switch (typeof arg) {
		case "boolean": {
			if (arg) return 1
			return 0
		}
		case "number":
			return Int.from(arg)
		case "string": {
			const [num, err] = Int.fromString(arg)
			if (err) {
				console.error(err)
				return 0
			}
			return num
		}
		default: {
			console.error(`not a number: ${arg}`)
			return 0
		}
	}
}

function nextArg(args: string): [string, string] {
	let parens = 0
	for (let i = 0; i < args.length; i++) {
		const ch = args[i]
		switch (true) {
			case ch === "(":
				parens += 1
				break
			case ch === ")":
				parens -= 1
				break
			case ch == "," && parens === 0:
				return [args.substring(0, i), args.substring(i + 1)]
		}
	}
	return [args, ""]
}

// function evalAbsolute(e: Evaluator, args: string): number {
// 	const value = evalToNumber(e, args)
// 	return Math.abs(value)
// }
//
// function evalCubeRoot(e: Evaluator, args: string): number {
// 	const value = evalToNumber(e, args)
// 	return Math.cbrt(value)
// }
//
// function evalCeiling(e: Evaluator, args: string): number {
// 	const value = evalToNumber(e, args)
// 	return Math.ceil(value)
// }
//
// function evalBaseEExpontential(e: Evaluator, args: string): number {
// 	const value = evalToNumber(e, args)
// 	return Math.exp(value)
// }
//
// function evalBase2Expontential(e: Evaluator, args: string): number {
// 	const value = evalToNumber(e, args)
// 	return 2 ** value
// }
//
// function evalFloor(e: Evaluator, args: string): number {
// 	const value = evalToNumber(e, args)
// 	return Math.floor(value)
// }
//
// function evalIf(e: Evaluator, args: string): boolean {
// 	let arg: string
// 	;[arg, args] = nextArg(args)
// 	const evaluated = e.evaluateNew(arg)
// 	const value = evalFrom(evaluated)
// 	if (value === 0) {
// 		;[, args] = nextArg(args)
// 	}
// 	;[arg] = nextArg(args)
// 	return Boolean(e.evaluateNew(arg))
// }
//
// function evalMaximum(e: Evaluator, args: string): number {
// 	let max = Number.MIN_SAFE_INTEGER
// 	while (args) {
// 		let arg: string
// 		;[arg, args] = nextArg(args)
// 		const value = evalToNumber(e, arg)
// 		max = Math.max(max, value)
// 	}
// 	return max
// }
//
// function evalMinimum(e: Evaluator, args: string): number {
// 	let min: number = Math.min()
// 	while (args) {
// 		let arg: string
// 		;[arg, args] = nextArg(args)
// 		const value = evalToNumber(e, arg)
// 		min = Math.min(min, value)
// 	}
// 	return min
// }
//
// function evalNaturalLog(e: Evaluator, args: string): number {
// 	const value = evalToNumber(e, args)
// 	return Math.log(value)
// }
//
// function evalNaturalLogSum(e: Evaluator, args: string): number {
// 	const value = evalToNumber(e, args)
// 	return Math.log1p(value)
// }
//
// function evalDecimalLog(e: Evaluator, args: string): number {
// 	const value = evalToNumber(e, args)
// 	return Math.log10(value)
// }
//
// function evalRound(e: Evaluator, args: string): number {
// 	const value = evalToNumber(e, args)
// 	return Math.round(value)
// }
//
// function evalSqrt(e: Evaluator, args: string): number {
// 	const value = evalToNumber(e, args)
// 	return Math.sqrt(value)
// }
//
// function evalDice(e: Evaluator, args: string): string {
// 	const rollArgs: Record<string, number> = { sides: 6, count: 1, modifier: 1, multiplier: 1 }
// 	const argArray = []
// 	let arg: string
// 	while (args) {
// 		;[arg, args] = nextArg(args)
// 		argArray.push(e.evaluateNew(arg))
// 	}
// 	switch (rollArgs.length) {
// 		case 4:
// 			rollArgs.multiplier = argArray[3]
// 			break
// 		case 3:
// 			rollArgs.modifier = argArray[2]
// 			break
// 		case 2:
// 			rollArgs.count = argArray[1]
// 			break
// 		case 1:
// 			rollArgs.sides = argArray[0]
// 	}
// 	const d = new DiceGURPS(rollArgs)
// 	return d.toString(true)
// }
//
// function evalRoll(e: Evaluator, a: string): number {
// 	if (a.indexOf("(") !== -1) {
// 		a = evalToString(e, a)
// 	}
// 	return DiceGURPS.fromString(a).roll(false)
// }
//
// function evalToBool(e: Evaluator, a: string): boolean {
// 	const evaluated = e.evaluateNew(a)
// 	switch (typeof evaluated) {
// 		case "boolean":
// 			return evaluated
// 		case "number":
// 			return evaluated !== 0
// 		case "string":
// 			if (evaluated === "true") return true
// 			if (evaluated === "false") return false
// 			return false
// 		default:
// 			return false
// 	}
// }
//
// function evalSigned(e: Evaluator, a: string): string {
// 	const n = evalToNumber(e, a)
// 	return n.signedString()
// }
//
// function evalSkillLevel(e: Evaluator, arg: string): number {
// 	const actor = e.resolver
// 	if (!(actor instanceof Actor && actor.isOfType(ActorType.Character))) return 0
//
// 	let [name, remaining] = nextArg(arg)
// 	name = evalToString(e, name)
// 	// const entity = e.resolver
// 	// let [name, remaining] = nextArg(arg)
// 	// name = evalToString(e, name)
// 	// if (!name) return 0
// 	// name = name.trim()
// 	// let specialization: string
// 	// ;[specialization, remaining] = nextArg(remaining)
// 	// specialization = specialization.trim()
// 	// if (!specialization || !evalToString(e, specialization)) return 0
// 	// specialization = specialization.replaceAll('"', "")
// 	// ;[arg] = nextArg(remaining)
// 	// arg = arg.trim()
// 	// let relative = false
// 	// if (arg) relative = evalToBool(e, arg)
// 	//
// 	// if (entity.system.isSkillLevelResolutionExcluded(name, specialization)) return 0
// 	//
// 	// entity.system.registerSkillLevelResolutionExclusion(name, specialization)
// 	// let level = Number.MIN_SAFE_INTEGER
// 	//
// 	// entity.itemCollections.skills.forEach(s => {
// 	// 	if (s.isOfType(ItemType.SkillContainer)) return
// 	// 	if (level !== Number.MIN_SAFE_INTEGER) return
// 	// 	if (equalFold(s.name || "", name) && equalFold(s.system.sp, specialization)) {
// 	// 		s.system.updateLevel()
// 	// 		if (relative) level = s.system.level.relativeLevel
// 	// 		else level = s.system.level.level
// 	// 	}
// 	// })
// 	//
// 	// entity.system.unregisterSkillLevelResolutionExclusion(name, specialization)
// 	// return level
// }
//
// function evalToNumber(e: Evaluator, arg: string): number {
// 	const evaluated = e.evaluateNew(arg)
// 	return evalFrom(evaluated)
// }
//
// export function evalToString(e: Evaluator, a: string): string {
// 	let evaluated: string | number | boolean
// 	try {
// 		evaluated = e.evaluateNew(a)
// 	} catch (err) {
// 		return ""
// 	}
// 	return String(evaluated)
// }
//
// export function evalEncumbrance(e: Evaluator, a: string): number {
// 	// eslint-disable-next-line prefer-const
// 	let [arg, remaining] = nextArg(a)
// 	const forSkills = evalToBool(e, arg)
// 	let returnFactor = false
// 	;[arg] = nextArg(remaining)
// 	if (arg.trim()) {
// 		returnFactor = evalToBool(e, remaining)
// 	}
// 	const entity = e.resolver
// 	if (!(entity instanceof Actor)) return 0
// 	if (!entity.isOfType(ActorType.Character)) return 0
//
// 	const level = forSkills ? entity.encumbrance.forSkills.level : entity.encumbrance.current.level
// 	if (returnFactor) return 1 - level / 5
// 	return level
// }
//
// export function evalHasTrait(e: Evaluator, a: string): boolean {
// 	const entity = e.resolver
// 	if (!entity) return false
// 	const arg = a.replaceAll(/^['"]|[']$/g, "")
// 	if (!(entity instanceof Actor)) return false
// 	if (!entity.isOfType(ActorType.Character)) return false
// 	return entity.itemCollections.traits.some(t => equalFold(t.name ?? "", arg))
// }
//
// export function evalTraitLevel(e: Evaluator, a: string): number {
// 	const entity = e.resolver
// 	if (!entity) return -1
// 	const arg = a.replaceAll(/^['"]|[']$/g, "")
// 	let levels = -1
// 	if (!(entity instanceof Actor)) return levels
// 	if (!entity.isOfType(ActorType.Character)) return levels
// 	entity.itemTypes[ItemType.Trait]
// 		.filter(t => t.name === arg)
// 		.every(t => {
// 			if (t.isLeveled) levels = t.levels
// 			return true
// 		})
// 	return levels
// }
//
// export function evalSSRT(e: Evaluator, a: string): number {
// 	let arg: string
// 	;[arg, a] = nextArg(a)
// 	const n = evalToString(e, arg)
// 	;[arg, a] = nextArg(a)
// 	const units = evalToString(e, arg)
// 	;[arg, a] = nextArg(a)
// 	const wantSize = evalToBool(e, arg)
// 	const length = Length.fromString(`${n} ${units}`)
// 	let result = yardsToValue(length, wantSize)
// 	if (!wantSize) {
// 		result = -result
// 	}
// 	return result
// }
//
// export function evalSSRTYards(e: Evaluator, a: string): number {
// 	const v = evalToNumber(e, a)
// 	return valueToYards(v)
// }
//
// function yardsToValue(length: number, allowNegative: boolean): number {
// 	const inches = Number(length)
// 	const feet = inches / 12
// 	let yards = inches / 36
// 	if (allowNegative) {
// 		if (inches <= 1 / 5) return -15
// 		else if (inches <= 1 / 3) return -14
// 		else if (inches <= 1 / 2) return -13
// 		else if (inches <= 2 / 3) return -12
// 		else if (inches <= 1) return -11
// 		else if (inches <= 1.5) return -10
// 		else if (inches <= 2) return -9
// 		else if (inches <= 3) return -8
// 		else if (inches <= 5) return -7
// 		else if (inches <= 8) return -6
// 		else if (feet <= 1) return -5
// 		else if (feet <= 1.5) return -4
// 		else if (feet <= 2) return -3
// 		else if (yards <= 1) return -2
// 		else if (yards < 1.5) return -1
// 	}
// 	if (yards <= 2) return 0
// 	let amt = 0
// 	while (yards > 10) {
// 		yards /= 10
// 		amt += 6
// 	}
// 	if (yards > 7) return amt + 4
// 	else if (yards > 5) return amt + 3
// 	else if (yards > 3) return amt + 2
// 	else if (yards > 2) return amt + 1
// 	else if (yards > 1.5) return amt
// 	else return amt - 1
// }
//
// /**
//  *
//  * @param value
//  */
// function valueToYards(value: number): number {
// 	if (value < -15) value = -15
// 	switch (value) {
// 		case -15:
// 			return 1 / 5 / 36
// 		case -14:
// 			return 1 / 3 / 36
// 		case -13:
// 			return 1 / 2 / 36
// 		case -12:
// 			return 2 / 3 / 36
// 		case -11:
// 			return 1 / 36
// 		case -10:
// 			return 1.5 / 36
// 		case -9:
// 			return 2 / 36
// 		case -8:
// 			return 3 / 36
// 		case -7:
// 			return 5 / 36
// 		case -6:
// 			return 8 / 36
// 		case -5:
// 			return 1 / 3
// 		case -4:
// 			return 1.5 / 3
// 		case -3:
// 			return 2 / 3
// 		case -2:
// 			return 1
// 		case -1:
// 			return 1.5
// 		case 0:
// 			return 2
// 		case 1:
// 			return 3
// 		case 2:
// 			return 5
// 		case 3:
// 			return 7
// 	}
// 	value -= 4
// 	let multiplier = 1
// 	for (let i = 0; i < value / 6; i++) multiplier *= 10
// 	let v = 0
// 	switch (value % 6) {
// 		case 0:
// 			v = 10
// 			break
// 		case 1:
// 			v = 15
// 			break
// 		case 2:
// 			v = 20
// 			break
// 		case 3:
// 			v = 30
// 			break
// 		case 4:
// 			v = 50
// 			break
// 		case 5:
// 			v = 70
// 	}
// 	return v * multiplier
// }
//
// export function evalRandomHeight(e: Evaluator, a: string): number {
// 	const entity = e.resolver
// 	if (!entity) return -1
// 	const stDecimal = evalToNumber(e, a)
// 	let base: number
// 	const st = Math.round(stDecimal)
// 	if (st < 7) base = 52
// 	else if (st > 13) base = 74
// 	else {
// 		switch (st) {
// 			case 7:
// 				base = 55
// 				break
// 			case 8:
// 				base = 58
// 				break
// 			case 9:
// 				base = 61
// 				break
// 			case 10:
// 				base = 63
// 				break
// 			case 11:
// 				base = 65
// 				break
// 			case 12:
// 				base = 68
// 				break
// 			case 13:
// 				base = 71
// 				break
// 			// this should never happen
// 			default:
// 				base = 0
// 				break
// 		}
// 	}
// 	return base + Math.round(Math.random() * 10)
// }
//
// export function evalRandomWeight(e: Evaluator, a: string): number | null {
// 	const entity = e.resolver
// 	if (!entity) return -1
// 	let arg: string
// 	;[arg, a] = nextArg(a)
// 	const stDecimal = evalToNumber(e, arg)
// 	let shift = 0
// 	if (arg !== "") shift = evalToNumber(e, a)
// 	if (isNaN(shift)) return null
// 	const st = Math.round(stDecimal)
// 	let skinny = false
// 	let overweight = false
// 	let fat = false
// 	let veryFat = false
//
// 	if (!(entity instanceof Actor)) return null
// 	if (!entity.isOfType(ActorType.Character)) return null
//
// 	entity.itemTypes[ItemType.Trait].forEach(t => {
// 		if (!t.enabled) return
// 		if (equalFold(t.name ?? "", "skinny")) skinny = true
// 		else if (equalFold(t.name ?? "", "overweight")) overweight = true
// 		else if (equalFold(t.name ?? "", "fat")) fat = true
// 		else if (equalFold(t.name ?? "", "very fat")) veryFat = true
// 	})
// 	let shiftAmt = Math.round(shift)
// 	if (shiftAmt !== 0) {
// 		if (skinny) shiftAmt -= 1
// 		else if (overweight) shiftAmt += 1
// 		else if (fat) shiftAmt += 2
// 		else if (veryFat) shiftAmt += 3
// 		skinny = false
// 		overweight = false
// 		fat = false
// 		veryFat = false
// 		switch (shiftAmt) {
// 			case 0:
// 				break
// 			case 1:
// 				overweight = true
// 				break
// 			case 2:
// 				fat = true
// 				break
// 			case 3:
// 				veryFat = true
// 				break
// 			default:
// 				if (shiftAmt < 0) skinny = true
// 				else veryFat = true
// 		}
// 	}
// 	let [lower, upper] = [0, 0]
// 	switch (true) {
// 		case skinny:
// 			if (st < 7) [lower, upper] = [40, 80]
// 			else if (st > 13) [lower, upper] = [115, 180]
// 			else
// 				switch (st) {
// 					case 7:
// 						;[lower, upper] = [50, 90]
// 						break
// 					case 8:
// 						;[lower, upper] = [60, 100]
// 						break
// 					case 9:
// 						;[lower, upper] = [70, 110]
// 						break
// 					case 10:
// 						;[lower, upper] = [80, 120]
// 						break
// 					case 11:
// 						;[lower, upper] = [85, 130]
// 						break
// 					case 12:
// 						;[lower, upper] = [95, 150]
// 						break
// 					case 13:
// 						;[lower, upper] = [105, 165]
// 						break
// 				}
// 			break
// 		case overweight:
// 			if (st < 7) [lower, upper] = [80, 160]
// 			else if (st > 13) [lower, upper] = [225, 355]
// 			else
// 				switch (st) {
// 					case 7:
// 						;[lower, upper] = [100, 175]
// 						break
// 					case 8:
// 						;[lower, upper] = [120, 195]
// 						break
// 					case 9:
// 						;[lower, upper] = [140, 215]
// 						break
// 					case 10:
// 						;[lower, upper] = [150, 230]
// 						break
// 					case 11:
// 						;[lower, upper] = [165, 255]
// 						break
// 					case 12:
// 						;[lower, upper] = [185, 290]
// 						break
// 					case 13:
// 						;[lower, upper] = [205, 320]
// 						break
// 				}
// 			break
// 		case fat:
// 			if (st < 7) [lower, upper] = [90, 180]
// 			else if (st > 13) [lower, upper] = [255, 405]
// 			else
// 				switch (st) {
// 					case 7:
// 						;[lower, upper] = [115, 205]
// 						break
// 					case 8:
// 						;[lower, upper] = [135, 225]
// 						break
// 					case 9:
// 						;[lower, upper] = [160, 250]
// 						break
// 					case 10:
// 						;[lower, upper] = [175, 265]
// 						break
// 					case 11:
// 						;[lower, upper] = [190, 295]
// 						break
// 					case 12:
// 						;[lower, upper] = [210, 330]
// 						break
// 					case 13:
// 						;[lower, upper] = [235, 370]
// 						break
// 				}
// 			break
// 		case veryFat:
// 			if (st < 7) [lower, upper] = [120, 240]
// 			else if (st > 13) [lower, upper] = [340, 540]
// 			else
// 				switch (st) {
// 					case 7:
// 						;[lower, upper] = [150, 270]
// 						break
// 					case 8:
// 						;[lower, upper] = [180, 300]
// 						break
// 					case 9:
// 						;[lower, upper] = [210, 330]
// 						break
// 					case 10:
// 						;[lower, upper] = [230, 350]
// 						break
// 					case 11:
// 						;[lower, upper] = [250, 390]
// 						break
// 					case 12:
// 						;[lower, upper] = [280, 440]
// 						break
// 					case 13:
// 						;[lower, upper] = [310, 490]
// 						break
// 				}
// 			if (shiftAmt > 3) {
// 				const delta = (upper - lower) * (2 / 3)
// 				lower += delta
// 				upper += delta
// 			}
// 			break
// 		default:
// 			if (st < 7) [lower, upper] = [60, 120]
// 			else if (st > 13) [lower, upper] = [170, 270]
// 			else
// 				switch (st) {
// 					case 7:
// 						;[lower, upper] = [75, 135]
// 						break
// 					case 8:
// 						;[lower, upper] = [90, 150]
// 						break
// 					case 9:
// 						;[lower, upper] = [105, 165]
// 						break
// 					case 10:
// 						;[lower, upper] = [115, 175]
// 						break
// 					case 11:
// 						;[lower, upper] = [125, 195]
// 						break
// 					case 12:
// 						;[lower, upper] = [140, 220]
// 						break
// 					case 13:
// 						;[lower, upper] = [155, 245]
// 						break
// 				}
// 	}
// 	return lower + Math.round(Math.random() * (1 + upper - lower))
// }
//
// function evalFrom(arg: boolean | string | number): number {
// 	switch (typeof arg) {
// 		case "boolean":
// 			if (arg) return 1
// 			return 0
// 		case "number":
// 			return arg
// 		case "string":
// 			return parseFloat(arg)
// 		default:
// 			throw new Error(`Not a number: ${arg}`)
// 	}
// }
//
// function nextArg(args: string): [string, string] {
// 	let parens = 0
// 	for (let i = 0; i < args.length; i++) {
// 		const ch = args[i]
// 		if (ch === "(") parens += 1
// 		else if (ch === ")") parens -= 1
// 		else if (ch === "," && parens === 0) return [args.substring(0, i), args.substring(i + 1)]
// 	}
// 	return [args, ""]
// }
