import {
	Operand,
	Operator,
	add,
	closeParen,
	divide,
	equal,
	greaterThan,
	greaterThanOrEqual,
	lessThan,
	lessThanOrEqual,
	logicalAnd,
	logicalOr,
	modulo,
	multiply,
	not,
	notEqual,
	opFunction,
	openParen,
	power,
	subtract,
} from "./types.ts"

/**
 *
 * @param dbzrz
 */
export function evalOperators(dbzrz: boolean): Operator[] {
	let eDivide: opFunction
	let eModulo: opFunction
	if (dbzrz) {
		eDivide = DivideAllowDivideByZero
		eModulo = ModuloAllowDivideByZero
	} else {
		eDivide = Divide
		eModulo = Modulo
	}

	return [
		openParen(),
		closeParen(),
		not(Not),
		logicalOr(LogicalOr),
		logicalAnd(LogicalAnd),
		equal(Equal),
		notEqual(NotEqual),
		greaterThan(GreaterThan),
		greaterThanOrEqual(GreaterThanOrEqual),
		lessThan(LessThan),
		lessThanOrEqual(LessThanOrEqual),
		add(Add, AddUnary),
		subtract(Subtract, SubtractUnary),
		multiply(Multiply),
		divide(eDivide),
		modulo(eModulo),
		power(Power),
	]
}

/**
 *
 * @param arg
 */
function Not(arg: Operand): boolean {
	const b = Boolean(arg)
	if (typeof b === "boolean") return !b
	const v = From(arg)
	if (v === 0) return true
	return false
}

/**
 *
 * @param left
 * @param right
 */
function LogicalOr(left: Operand, right: Operand): boolean {
	const l = From(left)
	if (l !== 0) return true
	let r = 0
	r = From(right)
	return r !== 0
}

/**
 *
 * @param left
 * @param right
 */
function LogicalAnd(left: Operand, right: Operand): boolean {
	const l = From(left)
	if (l === 0) return false
	let r = 0
	r = From(right)
	return r !== 0
}

/**
 *
 * @param left
 * @param right
 */
function Equal(left: Operand, right: Operand): boolean {
	let l
	let r
	try {
		l = From(left)
		r = From(right)
	} catch (err) {
		console.error(err)
		return left?.toString() === right?.toString()
	}
	return l === r
}

/**
 *
 * @param left
 * @param right
 */
function NotEqual(left: Operand, right: Operand): boolean {
	let l
	let r
	try {
		l = From(left)
		r = From(right)
	} catch (err) {
		console.error(err)
		return left?.toString() !== right?.toString()
	}
	return l !== r
}

/**
 *
 * @param left
 * @param right
 */
function GreaterThan(left: Operand, right: Operand): boolean {
	let l
	let r
	try {
		l = From(left)
		r = From(right)
	} catch (err) {
		console.error(err)
		return (left?.toString() ?? "") > (right?.toString() ?? "")
	}
	return l > r
}

/**
 *
 * @param left
 * @param right
 */
function GreaterThanOrEqual(left: Operand, right: Operand): boolean {
	let l
	let r
	try {
		l = From(left)
		r = From(right)
	} catch (err) {
		console.error(err)
		return (left?.toString() ?? "") >= (right?.toString() ?? "")
	}
	return l >= r
}

/**
 *
 * @param left
 * @param right
 */
function LessThan(left: Operand, right: Operand): boolean {
	let l
	let r
	try {
		l = From(left)
		r = From(right)
	} catch (err) {
		console.error(err)
		return (left?.toString() ?? "") < (right?.toString() ?? "")
	}
	return l < r
}

/**
 *
 * @param left
 * @param right
 */
function LessThanOrEqual(left: Operand, right: Operand): boolean {
	let l
	let r
	try {
		l = From(left)
		r = From(right)
	} catch (err) {
		console.error(err)
		return (left?.toString() ?? "") <= (right?.toString() ?? "")
	}
	return l <= r
}

/**
 *
 * @param left
 * @param right
 */
function Add(left: Operand, right: Operand): Operand {
	let l
	let r
	try {
		l = From(left)
		r = From(right)
	} catch (err) {
		console.error(err)
		return (left?.toString() ?? "") + (right?.toString() ?? "")
	}
	return l + r
}

/**
 *
 * @param arg
 */
function AddUnary(arg: Operand): Operand {
	return From(arg)
}

/**
 *
 * @param left
 * @param right
 */
function Subtract(left: Operand, right: Operand): number {
	const l = From(left)
	let r = 0
	r = From(right)
	return l - r
}

/**
 *
 * @param arg
 */
function SubtractUnary(arg: Operand): number {
	const v = From(arg)
	return -v
}

/**
 *
 * @param left
 * @param right
 */
function Multiply(left: Operand, right: Operand): number {
	const l = From(left)
	let r = 0
	r = From(right)
	return l * r
}

/**
 *
 * @param left
 * @param right
 */
function Divide(left: Operand, right: Operand): number {
	const l = From(left)
	let r = 0
	r = From(right)
	if (r === 0) throw new Error("Divide by zero")
	return l / r
}

/**
 *
 * @param left
 * @param right
 */
function DivideAllowDivideByZero(left: Operand, right: Operand): number {
	const l = From(left)
	let r = 0
	r = From(right)
	if (r === 0) return r
	return l / r
}

/**
 *
 * @param left
 * @param right
 */
function Modulo(left: Operand, right: Operand): number {
	const l = From(left)
	let r = 0
	r = From(right)
	if (r === 0) throw new Error("Divide by zero")
	return l % r
}

/**
 *
 * @param left
 * @param right
 */
function ModuloAllowDivideByZero(left: Operand, right: Operand): number {
	const l = From(left)
	let r = 0
	r = From(right)
	if (r === 0) return r
	return l % r
}

/**
 *
 * @param left
 * @param right
 */
function Power(left: Operand, right: Operand): number {
	const l = From(left)
	let r = 0
	r = From(right)
	return Math.pow(l, r)
}

/**
 *
 * @param arg
 */
function From(arg: Operand): number {
	switch (true) {
		case typeof arg === "boolean":
			if (arg) return 1
			return 0
		case typeof arg === "number":
			return arg
		case typeof arg === "string":
			return parseFloat(arg)
		default:
			console.error(`Not a number: ${arg}`)
			return 0
	}
}
