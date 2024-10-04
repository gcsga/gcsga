import { ErrorGURPS, Int, Length, encumbrance, trimS } from "@util"
import { equalFold } from "../../data/item/compontents/string-criteria.ts"
import { EvalFunction, Evaluator, Operand, resolverIsCharacter } from "./eval.ts"
import { ItemType } from "@module/data/constants.ts"
import { DiceGURPS } from "@module/data/dice.ts"

export function evalFunctions(): Map<string, EvalFunction> {
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
	const value = evalToFixed(e, args)
	if (value === null) return null
	return Int.from(Math.log1p(value))
}

function evalRound(e: Evaluator, args: string): Operand {
	const value = evalToFixed(e, args)
	if (value === null) return null
	return Math.round(value)
}

function evalSquareRoot(e: Evaluator, args: string): Operand {
	const value = evalToFixed(e, args)
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
	evaluated = e.evaluateNew(args)
	switch (typeof evaluated) {
		case "boolean":
			return evaluated
		case "number":
			return evaluated !== 0
		case "string": {
			evaluated = evaluated.toLowerCase()
			return evaluated === "1" || evaluated === "true" || evaluated === "yes" || evaluated === "on"
		}
		default:
			return false
	}
}

function evalToNumber(e: Evaluator, args: string): number {
	const evaluated: Operand = e.evaluateNew(args)
	return fixedFrom(evaluated)
}

function evalToString(e: Evaluator, args: string): string {
	const v: Operand = e.evaluateNew(args)
	return `${v}`
}

function evalEncumbrance(e: Evaluator, args: string): number {
	// eslint-disbale-next-line prefer-const
	let [arg, remaining] = nextArg(args)
	const forSkills = evalToBool(e, arg)
	let returnFactor = false
	;[arg] = nextArg(remaining)
	arg = arg.trim()
	if (arg !== "") {
		returnFactor = evalToBool(e, remaining)
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
		return 0
	}

	let specialization: string
	;[specialization, remaining] = nextArg(remaining)
	specialization = specialization.trim()
	if (specialization !== "") {
		try {
			specialization = evalToString(e, specialization)
		} catch (err) {
			console.error(err)
			return 0
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
			return 0
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
				if (levels === -1) levels = trait.system.levels ?? 0
				else levels += trait.system.levels ?? 0
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
	const name = evalToString(e, trimS(arg, `"`))
	;[arg] = nextArg(args)
	const usage = evalToString(e, trimS(arg, `"`))
	for (const w of actor.parent.itemCollections.meleeWeapons) {
		if (equalFold(w.system.processedName, name) && equalFold(w.system.usageWithReplacements, usage))
			return w.system.damage.resolvedValue(null)
	}
	for (const w of actor.parent.itemCollections.rangedWeapons) {
		if (equalFold(w.system.processedName, name) && equalFold(w.system.usageWithReplacements, usage))
			return w.system.damage.resolvedValue(null)
	}
	return ""
}

function evalDice(e: Evaluator, args: string): string {
	const argList: number[] = []
	while (args !== "") {
		let arg: string
		;[arg, args] = nextArg(args)
		const n = evalToNumber(e, arg)
		argList.push(n)
	}
	let d = new DiceGURPS()
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
		first = evalToString(e, first)
	}

	let second: string
	;[second, args] = nextArg(args)
	if (second.indexOf("(") !== -1) {
		second = evalToString(e, second)
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
		first = evalToString(e, first)
	}

	let second: string
	;[second, args] = nextArg(args)
	if (second.indexOf("(") !== -1) {
		second = evalToString(e, second)
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
	const d = convertToDice(e, args)
	return d.count
}

function evalDiceSides(e: Evaluator, args: string): number {
	const d = convertToDice(e, args)
	return d.sides
}

function evalDiceModifier(e: Evaluator, args: string): number {
	const d = convertToDice(e, args)
	return d.modifier
}

function evalDiceMultiplier(e: Evaluator, args: string): number {
	const d = convertToDice(e, args)
	return d.multiplier
}

function evalRoll(e: Evaluator, args: string): number {
	const d = convertToDice(e, args)
	return Int.from(d.roll(false))
}

function convertToDice(e: Evaluator, args: string): DiceGURPS {
	if (args.indexOf("(") !== 1) {
		args = evalToString(e, args)
	}
	return DiceGURPS.fromString(args)
}

function evalSigned(e: Evaluator, args: string): string {
	let n: number
	n = evalToNumber(e, args)
	return n.signedString()
}

function evalSSRT(e: Evaluator, args: string): number {
	// Takes 3 args: length (number), units (string), flag (bool) indicating for size (true) or speed/range (false)
	let arg = ""
	;[arg, args] = nextArg(args)
	let n: string
	n = evalToString(e, arg)
	;[arg, args] = nextArg(args)
	let units = ""
	units = evalToString(e, arg)
	;[arg, args] = nextArg(args)
	let wantSize: boolean
	wantSize = evalToBool(e, arg)

	let length: number
	length = Length.fromString(n + " " + units, Length.Unit.Yard)

	let result = yardsToValue(length, wantSize)
	if (!wantSize) result = -result
	return Int.from(result)
}

function evalSSRTYards(e: Evaluator, args: string): number {
	const v = evalToNumber(e, args)
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
	stDecimal = evalToNumber(e, args)
	const st = Int.from(stDecimal)
	const r = (n: number) => Math.random() * n
	return Int.from(68 + (st - 10) * 2 + (r(6) + 1) - (r(6) + 1))
}

function evalRandomWeight(e: Evaluator, args: string): number {
	const actor = e.resolver
	if (!resolverIsCharacter(actor)) {
		return -1
	}
	let arg = ""
	;[arg, args] = nextArg(args)
	let stDecimal: number
	stDecimal = evalToNumber(e, arg)
	const st = Int.from(stDecimal)
	let adj = 0
	if (args !== "") {
		let adjDecimal: number
		adjDecimal = evalToNumber(e, args)
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
			case ch === "," && parens === 0:
				return [args.substring(0, i), args.substring(i + 1)]
		}
	}
	return [args, ""]
}

export { evalToBool, evalToNumber, evalToString, evalToFixed }
