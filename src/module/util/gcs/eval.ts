import { ErrorGURPS, StringBuilder } from "@util"
import { Operator } from "./operators.ts"
import { type CharacterData } from "@module/data/actor/character.ts"
import { ActorType } from "@module/data/constants.ts"

type VariableResolver = {
	resolveVariable: (variableName: string) => string
}
export type ExpressionOperand = {
	value: string
	unaryOp: Operator
}
export type ExpressionOperator = {
	// op: Operator | null
	op: Operator | null
	unaryOp: Operator | null
}
export type ExpressionTree = {
	evaluator: Evaluator
	left?: Operand
	right?: Operand
	op?: Operator
	unaryOp?: Operator
}
// export type ExpressionTree =
// 	| {
// 			evaluator: Evaluator
// 			left: Operand
// 			right: Operand
// 			op: Operator
// 	  }
// 	| {
// 			evaluator: Evaluator
// 			left: Operand
// 			unaryOp: Operator
// 	  }
export type Function = (evaluator: Evaluator, args: string) => Operand
export type ParsedFunction = {
	unaryOp: Operator
	func: Function
	args: string
}
export type Operand = ExpressionOperand | ExpressionTree | ParsedFunction | number | boolean | string | null

export function resolverIsCharacter(resolver: VariableResolver | null): resolver is CharacterData {
	return resolver instanceof Actor && resolver.type == ActorType.Character
}

function isExpressionOperand(operand: Operand): operand is ExpressionOperand {
	return (
		typeof operand === "object" &&
		operand !== null &&
		"value" in operand &&
		"unaryOp" in operand &&
		typeof (operand as ExpressionOperand).value === "string" &&
		(operand as ExpressionOperand).unaryOp instanceof Operator
	)
}

function isExpressionTree(operand: Operand): operand is ExpressionTree {
	return (
		typeof operand === "object" &&
		operand !== null &&
		"evaluator" in operand &&
		"left" in operand &&
		(operand as ExpressionTree).evaluator instanceof Evaluator &&
		(("right" in operand && "op" in operand && (operand as any).op instanceof Operator) ||
			("unaryOp" in operand && (operand as any).unaryOp instanceof Operator))
	)
}

function isParsedFunction(operand: Operand): operand is ParsedFunction {
	return (
		typeof operand === "object" &&
		operand !== null &&
		"unaryOp" in operand &&
		"func" in operand &&
		"args" in operand &&
		(operand as ParsedFunction).unaryOp instanceof Operator &&
		typeof (operand as ParsedFunction).func === "function" &&
		typeof (operand as ParsedFunction).args === "string"
	)
}

export class Evaluator {
	resolver: VariableResolver | null
	operators: Operator[]
	functions: Map<string, Function>
	operandStack: Operand[]
	operatorStack: ExpressionOperator[]

	constructor(resolver: Evaluator["resolver"], operators: Evaluator["operators"], functions: Evaluator["functions"]) {
		this.resolver = resolver
		this.operators = operators
		this.functions = functions
		this.operandStack = []
		this.operatorStack = []
	}

	evaluate(expression: string): Operand {
		try {
			this.parse(expression)
		} catch (err) {
			console.error(err)
			return null
		}
		while (this.operatorStack.length !== 0) this.processTree()
		if (this.operandStack.length === 0) return ""
		return this.evaluateOperand(this.operandStack.at(-1))
	}

	evaluateNew(expression: string): Operand {
		const other = new Evaluator(this.resolver, this.operators, this.functions)
		return other.evaluate(expression)
	}

	parse(expression: string): void {
		let unaryOp: Operator | null = null
		let haveOperand = false
		this.operandStack = []
		this.operatorStack = []
		let i = 0
		while (i < expression.length) {
			const ch = expression[i]
			if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
				i += 1
				continue
			}
			const [opIndex, op] = this.nextOperator(expression, i, null)
			if (opIndex > 1 || opIndex === -1) {
				i = this.processOperand(expression, i, opIndex, unaryOp!)
				haveOperand = true
				unaryOp = null
			}
			if (opIndex === i) {
				if (op !== null && op.evaluateUnary !== null && i === 0) {
					i = opIndex + op.symbol.length
					if (unaryOp) throw ErrorGURPS(`consecutive unary operators are not allowed at index ${i}`)
					unaryOp = op
				} else {
					i = this.processOperator(expression, opIndex, op, haveOperand, unaryOp)
					unaryOp = null
				}
				if (op === null || op.symbol !== ")") {
					haveOperand = false
				}
			}
		}
	}

	nextOperator(expression: string, start: number, match: Operator | null): [number, Operator | null] {
		for (let i = start; i < expression.length; i++) {
			if (match !== null) {
				if (match.match(expression, i, expression.length)) return [i, match]
			} else {
				for (const op of this.operators) {
					if (op.match(expression, i, expression.length)) {
						return [i, op]
					}
				}
			}
		}
		return [-1, null]
	}

	processOperand(expression: string, start: number, opIndex: number, unaryOp: Operator): number {
		if (opIndex === -1) {
			const text = expression.substring(start).trim()
			if (text === "") {
				console.error(`expression is invalid at index ${start}`)
				return -1
			}
			this.operandStack.push({ value: text, unaryOp })
			return expression.length
		}
		const text = expression.substring(start, opIndex).trim()
		if (text === "") {
			console.error(`expression is invalid at index ${start}`)
			return -1
		}
		this.operandStack.push({ value: text, unaryOp })
		return opIndex
	}

	processOperator(
		expression: string,
		index: number,
		op: Operator | null,
		haveOperand: boolean,
		unaryOp: Operator | null,
	): number {
		if (haveOperand && op !== null && op.symbol === "(") {
			try {
				;[index, op] = this.processFunction(expression, index)
			} catch (err) {
				console.log(err)
				return -1
			}
			index += op!.symbol.length
			let tmp: number
			;[tmp, op] = this.nextOperator(expression, index, null)
			if (op === null) return index
			index = tmp
		}
		switch (op?.symbol) {
			case "(":
				this.operatorStack.push({ op, unaryOp })
				break
			case ")": {
				let stackOp: ExpressionOperator | null = null
				if (this.operatorStack.length > 0) {
					stackOp = this.operatorStack.at(-1)!
				}
				while (stackOp !== null && stackOp.op!.symbol !== "(") {
					this.processTree()
					if (this.operatorStack.length > 0) {
						stackOp = this.operatorStack.at(-1)!
					} else {
						stackOp = null
					}
				}
				if (this.operatorStack.length === 0) {
					console.error(`invalid expression at index ${index}`)
					return -1
				}
				stackOp = this.operatorStack.at(-1)!
				if (stackOp.op?.symbol !== "(") {
					console.error(`invalid expression at index ${index}`)
					return -1
				}
				this.operatorStack.pop()
				if (stackOp.unaryOp !== null) {
					const left = this.operandStack.pop()!
					this.operandStack.push({ evaluator: this, left, unaryOp: stackOp.unaryOp })
				}
				break
			}
			default:
				if (this.operatorStack.length > 0) {
					let stackOp: ExpressionOperator | null = this.operatorStack.at(-1) ?? null
					while (stackOp !== null && stackOp.op!.precedence >= op!.precedence) {
						this.processTree()
						if (this.operatorStack.length > 0) {
							stackOp = this.operatorStack.at(-1) ?? null
						} else {
							stackOp = null
						}
					}
				}
				this.operatorStack.push({ op, unaryOp })
		}
		return index + op!.symbol.length
	}

	processFunction(expression: string, opIndex: number): [number, Operator | null] {
		let op: Operator | null = null
		let parens = 1
		let next = opIndex
		while (parens > 0) {
			;[next, op] = this.nextOperator(expression, next + 1, null)
			if (op === null) {
				console.error(`function not closed at index ${opIndex}`)
				return [-1, null]
			}
			switch (op.symbol) {
				case "(":
					parens += 1
					break
				case ")":
					parens -= 1
					break
			}
		}
		if (this.operandStack.length === 0) {
			console.error(`invalid stack at index ${next}`)
			return [-1, null]
		}
		const operand = this.operandStack.at(-1) ?? null
		if (!isExpressionOperand(operand)) {
			console.error(`unexpected operand stack value at index ${next}`)
			return [-1, null]
		}
		this.operandStack.pop()
		const f = this.functions.get(operand.value)
		if (!f) {
			console.error(`function not defined: ${operand.value}`)
			return [-1, null]
		}
		this.operandStack.push({ func: f, args: expression.substring(opIndex + 1, next), unaryOp: operand.unaryOp })
		return [next, op]
	}

	processTree(): void {
		let right: Operand | null = null
		if (this.operandStack.length > 0) {
			right = this.operandStack.pop()!
		}
		let left: Operand | null = null
		if (this.operandStack.length > 0) {
			left = this.operandStack.pop()!
		}
		const op = this.operatorStack.pop()!
		this.operandStack.push({ evaluator: this, left, right, op: op.op! })
	}

	evaluateOperand(operand: Operand = null): Operand {
		switch (true) {
			case isExpressionTree(operand): {
				let left: Operand
				try {
					left = operand.evaluator.evaluateOperand(operand.left)
				} catch (err) {
					return null
				}
				let right: Operand
				try {
					right = operand.evaluator.evaluateOperand(operand.right)
				} catch (err) {
					return null
				}
				if (operand.left !== null && operand.right !== null) {
					if (!operand.op || operand.op.evaluate === null) {
						console.error("operator does not have Evaluate function defined")
						return null
					}
					let v: Operand
					try {
						v = operand.op.evaluate(left, right)
					} catch (err) {
						console.error(err)
						return null
					}
					if (operand.unaryOp && operand.unaryOp.evaluateUnary) {
						return operand.unaryOp.evaluateUnary(v)
					}
					return v
				}

				let v: Operand
				if (!operand.right) v = left
				else v = right
				if (v) {
					try {
						if (operand.unaryOp && operand.unaryOp.evaluateUnary) {
							v = operand.unaryOp.evaluateUnary(v)
						} else if (operand.op && operand.op.evaluateUnary) {
							v = operand.op.evaluateUnary(v)
						}
					} catch (err) {
						console.error(err)
						return null
					}
				}

				if (v === null) {
					console.error("expression is invalid")
					return null
				}
				return v
			}
			case isExpressionOperand(operand): {
				let v: Operand
				try {
					v = this.replaceVariables(operand.value)
				} catch (err) {
					console.log(err)
					return null
				}
				if (operand.unaryOp && operand.unaryOp.evaluateUnary) return operand.unaryOp.evaluateUnary(v)
				return v
			}
			case isParsedFunction(operand): {
				let s: string
				try {
					s = this.replaceVariables(operand.args)
				} catch (err) {
					console.log(err)
					return null
				}
				let v: Operand
				try {
					v = operand.func(this, s)
				} catch (err) {
					console.log(err)
					return null
				}
				if (operand.unaryOp && operand.unaryOp.evaluateUnary) return operand.unaryOp.evaluateUnary(v)
				return v
			}
			default:
				if (operand !== null) {
					console.error("invalid expression")
					return null
				}
				return null
		}
	}

	replaceVariables(expression: string): string {
		let dollar = expression.indexOf("$")
		if (dollar === -1) return expression
		if (this.resolver === null) {
			throw ErrorGURPS(`no variable resolver, yet variables present at index ${dollar}`)
		}
		while (dollar >= 0) {
			let last = dollar
			const tempExpression = expression.substring(dollar + 1)
			for (let i = 0; i < tempExpression.length; i++) {
				const ch = tempExpression[i]
				if (
					ch === "_" ||
					ch === "." ||
					ch === "#" ||
					(ch >= "A" && ch <= "Z") ||
					(ch >= "a" && ch <= "z") ||
					(i !== 0 && ch >= "0" && ch <= "9")
				) {
					last = dollar + 1 + i
				} else {
					break
				}
			}
			if (dollar === last) throw ErrorGURPS(`invalid variable at index ${dollar}`)
			const name = expression.substring(dollar + 1, last + 1)
			const v = this.resolver.resolveVariable(name)
			if (v.trim() === "") {
				throw ErrorGURPS(`unable to resolve variable $${name}`)
			}
			const buffer = new StringBuilder()
			if (dollar > 0) buffer.push(expression.substring(0, dollar))
			buffer.push(v)
			if (last + 1 < expression.length) buffer.push(expression.substring(last + 1))
			expression = buffer.toString()
			dollar = expression.indexOf("$")
		}
		return expression
	}
}
