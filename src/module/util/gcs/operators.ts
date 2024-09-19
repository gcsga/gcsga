import { Int } from "@util"
import { type Operand } from "./eval.ts"

type OpFunc = (left: Operand, right: Operand) => Operand
type UnaryOpFunc = (arg: Operand) => Operand

export class Operator {
	evaluate: OpFunc | null = null
	evaluateUnary: UnaryOpFunc | null
	symbol: string
	precedence: number

	constructor(options: { symbol: string; evaluate?: OpFunc; evaluateUnary?: UnaryOpFunc; precedence?: number }) {
		this.symbol = options.symbol
		this.evaluate = options.evaluate ?? null
		this.evaluateUnary = options.evaluateUnary ?? null
		this.precedence = options.precedence ?? 0
	}

	match(expression: string, start: number, max: number): boolean {
		if (max - start < this.symbol.length) return false

		const matches = this.symbol === expression.substring(start, start + this.symbol.length)
		if (
			matches &&
			this.symbol.length === 1 &&
			this.symbol === "-" &&
			start > 1 &&
			expression.substring(start - 1, start) === "e"
		) {
			const ch = expression.at(start - 2)!
			if (ch >= "0" && ch <= "9") return false
		}
		return matches
	}
}

export function evalOperators(divideByZeroReturnsZero: boolean): Operator[] {
	const [d, m] = divideByZeroReturnsZero ? [divideAllowDivideByZero, moduloAllowDivideByZero] : [divide, modulo]
	return [
		new Operator({ symbol: "(" }),
		new Operator({ symbol: ")" }),
		new Operator({ symbol: "||", evaluate: logicalOr, precedence: 10 }),
		new Operator({ symbol: "&&", evaluate: logicalAnd, precedence: 20 }),
		new Operator({ symbol: "!", evaluateUnary: not }),
		new Operator({ symbol: "==", evaluate: equal, precedence: 30 }),
		new Operator({ symbol: "!=", evaluate: notEqual, precedence: 30 }),
		new Operator({ symbol: ">", evaluate: greaterThan, precedence: 40 }),
		new Operator({ symbol: ">=", evaluate: greaterThanOrEqual, precedence: 40 }),
		new Operator({ symbol: "<", evaluate: lessThan, precedence: 40 }),
		new Operator({ symbol: "<=", evaluate: lessThanOrEqual, precedence: 40 }),
		new Operator({ symbol: "+", evaluate: add, evaluateUnary: addUnary, precedence: 50 }),
		new Operator({ symbol: "-", evaluate: subtract, evaluateUnary: subtractUnary, precedence: 50 }),
		new Operator({ symbol: "*", evaluate: multiply, precedence: 60 }),
		new Operator({ symbol: "/", evaluate: d, precedence: 60 }),
		new Operator({ symbol: "%", evaluate: m, precedence: 60 }),
		new Operator({ symbol: "^", evaluate: power, precedence: 70 }),
	]
}

function not(arg: Operand): boolean | null {
	if (typeof arg === "boolean") return !arg
	const v = fixedFrom(arg)
	if (v === null) return null
	if (v === 0) return true
	return false
}

function logicalOr(left: Operand, right: Operand): boolean | null {
	const l = fixedFrom(left)
	if (l === null) return null
	if (l !== 0) return true
	const r = fixedFrom(right)
	if (l === null) return null
	return r !== 0
}

function logicalAnd(left: Operand, right: Operand): boolean | null {
	const l = fixedFrom(left)
	if (l === null) return null
	if (l === 0) return false
	const r = fixedFrom(right)
	if (l === null) return null
	return r !== 0
}

function equal(left: Operand, right: Operand): boolean {
	let l
	let r
	try {
		l = fixedFrom(left)
		r = fixedFrom(right)
	} catch (err) {
		console.error(err)
		return left?.toString() === right?.toString()
	}
	return l === r
}

function notEqual(left: Operand, right: Operand): boolean {
	let l
	let r
	try {
		l = fixedFrom(left)
		r = fixedFrom(right)
	} catch (err) {
		console.error(err)
		return left?.toString() !== right?.toString()
	}
	return l !== r
}

function greaterThan(left: Operand, right: Operand): boolean {
	let l
	let r
	try {
		l = fixedFrom(left)
		r = fixedFrom(right)
	} catch (err) {
		console.error(err)
		return (left?.toString() ?? "") > (right?.toString() ?? "")
	}
	return l > r
}

function greaterThanOrEqual(left: Operand, right: Operand): boolean {
	let l
	let r
	try {
		l = fixedFrom(left)
		r = fixedFrom(right)
	} catch (err) {
		console.error(err)
		return (left?.toString() ?? "") >= (right?.toString() ?? "")
	}
	return l >= r
}

function lessThan(left: Operand, right: Operand): boolean {
	let l
	let r
	try {
		l = fixedFrom(left)
		r = fixedFrom(right)
	} catch (err) {
		console.error(err)
		return (left?.toString() ?? "") < (right?.toString() ?? "")
	}
	return l < r
}

function lessThanOrEqual(left: Operand, right: Operand): boolean {
	let l
	let r
	try {
		l = fixedFrom(left)
		r = fixedFrom(right)
	} catch (err) {
		console.error(err)
		return (left?.toString() ?? "") <= (right?.toString() ?? "")
	}
	return l <= r
}

function add(left: Operand, right: Operand): Operand {
	let l
	let r
	try {
		l = fixedFrom(left)
		r = fixedFrom(right)
	} catch (err) {
		console.error(err)
		return (left?.toString() ?? "") + (right?.toString() ?? "")
	}
	return l + r
}

function addUnary(arg: Operand): Operand {
	return fixedFrom(arg)
}

function subtract(left: Operand, right: Operand): number {
	const l = fixedFrom(left)
	let r = 0
	r = fixedFrom(right)
	return l - r
}

function subtractUnary(arg: Operand): number {
	const v = fixedFrom(arg)
	return -v
}

function multiply(left: Operand, right: Operand): number {
	const l = fixedFrom(left)
	let r = 0
	r = fixedFrom(right)
	return l * r
}

function divide(left: Operand, right: Operand): number {
	const l = fixedFrom(left)
	let r = 0
	r = fixedFrom(right)
	if (r === 0) throw new Error("Divide by zero")
	return l / r
}

function divideAllowDivideByZero(left: Operand, right: Operand): number {
	const l = fixedFrom(left)
	let r = 0
	r = fixedFrom(right)
	if (r === 0) return r
	return l / r
}

function modulo(left: Operand, right: Operand): number {
	const l = fixedFrom(left)
	let r = 0
	r = fixedFrom(right)
	if (r === 0) throw new Error("Divide by zero")
	return l % r
}

function moduloAllowDivideByZero(left: Operand, right: Operand): number {
	const l = fixedFrom(left)
	let r = 0
	r = fixedFrom(right)
	if (r === 0) return r
	return l % r
}

function power(left: Operand, right: Operand): number {
	const l = fixedFrom(left)
	let r = 0
	r = fixedFrom(right)
	return Math.pow(l, r)
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
			const [int] = Int.fromString(arg)
			return int
		}
		default:
			console.error(`not a number: ${arg}`)
			return 0
	}
}
